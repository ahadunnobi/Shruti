"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type VoiceRecorderProps = {
  onAudioReady: (audioBlob: Blob) => void;
};

export function VoiceRecorder({ onAudioReady }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveTick, setWaveTick] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }
    const timer = setInterval(() => setWaveTick((prev) => prev + 1), 180);
    return () => clearInterval(timer);
  }, [isRecording]);

  const bars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        height: 8 + ((waveTick + index * 3) % 14) * 2
      })),
    [waveTick]
  );

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const nextUrl = URL.createObjectURL(blob);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioBlob(blob);
      setAudioUrl(nextUrl);
      onAudioReady(blob);
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-semibold">Voice recorder</h2>
      <div className="flex h-20 items-end gap-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
        {bars.map((bar) => (
          <span
            key={bar.id}
            className={[
              "w-2 rounded-sm transition-all",
              isRecording ? "bg-emerald-500" : "bg-slate-400"
            ].join(" ")}
            style={{ height: `${bar.height}px` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Start recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            Stop recording
          </button>
        )}
      </div>

      {audioBlob && audioUrl ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300">Replay recording</p>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      ) : null}
    </div>
  );
}
