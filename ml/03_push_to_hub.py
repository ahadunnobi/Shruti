"""
Prompt 25 (Part A) — Push fine-tuned model to Hugging Face Hub
==============================================================
After running 02_train_model.py, use this script to upload your model
so you can create a Hugging Face Inference Endpoint from it.

Steps:
  1. pip install huggingface_hub
  2. Set HF_TOKEN in your environment (or .env.local)
  3. python ml/03_push_to_hub.py
"""

import os
from pathlib import Path
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
)
from huggingface_hub import HfApi

# ── Config ────────────────────────────────────────────────────────────────────
LOCAL_MODEL_DIR = "ml/mental_health_model"
HF_USERNAME     = os.environ.get("HF_USERNAME", "YOUR_HF_USERNAME")   # ← change
REPO_NAME       = "shruti-mental-health-distilbert"
REPO_ID         = f"{HF_USERNAME}/{REPO_NAME}"
HF_TOKEN        = os.environ.get("HF_TOKEN")                          # ← from env

if not HF_TOKEN:
    raise EnvironmentError("Set the HF_TOKEN environment variable before running.")

# ── 1. Load local model & tokenizer ──────────────────────────────────────────
print(f"Loading model from {LOCAL_MODEL_DIR} …")
model     = AutoModelForSequenceClassification.from_pretrained(LOCAL_MODEL_DIR)
tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_DIR)

# ── 2. Create or confirm repository on Hub ────────────────────────────────────
api = HfApi(token=HF_TOKEN)
api.create_repo(repo_id=REPO_ID, exist_ok=True, private=False)
print(f"Hub repo: https://huggingface.co/{REPO_ID}")

# ── 3. Push model + tokenizer ─────────────────────────────────────────────────
print("Uploading model (this may take a few minutes) …")
model.push_to_hub(REPO_ID, token=HF_TOKEN)
tokenizer.push_to_hub(REPO_ID, token=HF_TOKEN)

# ── 4. Also upload label_mapping.json ─────────────────────────────────────────
label_map = Path(LOCAL_MODEL_DIR) / "label_mapping.json"
if label_map.exists():
    api.upload_file(
        path_or_fileobj=str(label_map),
        path_in_repo="label_mapping.json",
        repo_id=REPO_ID,
        token=HF_TOKEN,
    )

print(f"\nDone! Model is live at https://huggingface.co/{REPO_ID}")
print("\nNext step:")
print("  1. Go to https://ui.endpoints.huggingface.co/")
print(f"  2. Click 'New Endpoint' → select '{REPO_ID}'")
print("  3. Choose instance type (CPU: free tier / GPU: paid)")
print("  4. Copy the Endpoint URL into CUSTOM_HF_MODEL_URL in .env.local")
