from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import librosa
import tempfile
import os

app = FastAPI(title="Vocal Tone Analysis Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def analyze_audio(file_path: str) -> dict:
    audio, sample_rate = librosa.load(file_path, sr=16000, mono=True)
    duration_sec = max(len(audio) / sample_rate, 1e-6)

    pitch_values, voiced_flags, _ = librosa.pyin(
        audio,
        fmin=librosa.note_to_hz("C2"),
        fmax=librosa.note_to_hz("C7"),
    )

    voiced_pitch = pitch_values[~np.isnan(pitch_values)]
    mean_pitch = float(np.mean(voiced_pitch)) if voiced_pitch.size else 0.0

    # Speech rate approximation using onset detection events per second.
    onset_env = librosa.onset.onset_strength(y=audio, sr=sample_rate)
    onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sample_rate)
    speech_rate = float(len(onsets) / duration_sec)

    # Stress heuristic normalized 0..1 from pitch + speech-rate ranges.
    pitch_component = np.clip((mean_pitch - 120.0) / 180.0, 0.0, 1.0)
    rate_component = np.clip((speech_rate - 2.0) / 4.0, 0.0, 1.0)
    stress_score = float((0.55 * pitch_component) + (0.45 * rate_component))

    return {
      "mean_pitch_hz": mean_pitch,
      "speech_rate": speech_rate,
      "stress_score": stress_score,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze-tone")
async def analyze_tone(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        # Keep original container (including webm) and rely on librosa/audioread decoding.
        return analyze_audio(temp_path)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)