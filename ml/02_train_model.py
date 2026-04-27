"""
Prompt 24 — Fine-tune DistilBERT on Reddit Mental Health Dataset
================================================================
Model  : distilbert-base-uncased
Task   : 5-class text classification
Labels : Depression | Anxiety | PTSD | Stress | Neutral

Dependencies:
    pip install datasets transformers[torch] scikit-learn accelerate evaluate

Output:
    ml/mental_health_model/   ← fine-tuned model + tokenizer
    ml/mental_health_model/label_mapping.json

GPU recommended. Trains in ~20 min on a T4 / RTX 3060.
On CPU only, reduce NUM_EPOCHS and BATCH_SIZE.
"""

import json
import os
import random
from pathlib import Path

import numpy as np
import pandas as pd
from datasets import load_dataset, DatasetDict, Dataset, ClassLabel
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
    EarlyStoppingCallback,
)
import evaluate

# ── Config ───────────────────────────────────────────────────────────────────
MODEL_NAME    = "distilbert-base-uncased"
OUTPUT_DIR    = "ml/mental_health_model"
MAX_LEN       = 256
BATCH_SIZE    = 16   # lower to 8 if OOM on CPU
NUM_EPOCHS    = 4
LEARNING_RATE = 2e-5
SEED          = 42

# ── Label mapping ─────────────────────────────────────────────────────────────
# Map subreddit names → our 5 target classes.
# Subreddits not listed here will be skipped.
SUBREDDIT_TO_LABEL: dict[str, str] = {
    # Depression
    "depression":           "Depression",
    "depression_help":      "Depression",
    "SuicideWatch":         "Depression",   # severe/overlapping
    # Anxiety
    "Anxiety":              "Anxiety",
    "PanicAttack":          "Anxiety",
    "socialanxiety":        "Anxiety",
    # PTSD
    "ptsd":                 "PTSD",
    "CPTSD":                "PTSD",
    "traumatoolbox":        "PTSD",
    # Stress
    "stress":               "Stress",
    "offmychest":           "Stress",
    "rant":                 "Stress",
    # Neutral
    "mentalhealth":         "Neutral",
    "Mindfulness":          "Neutral",
    "mentalillness":        "Neutral",
}

LABEL_NAMES = ["Depression", "Anxiety", "PTSD", "Stress", "Neutral"]
LABEL2ID = {l: i for i, l in enumerate(LABEL_NAMES)}
ID2LABEL  = {i: l for l, i in LABEL2ID.items()}

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

# ── 1. Load & preprocess dataset ─────────────────────────────────────────────
print("Loading dataset …")
raw = load_dataset("solomonk/reddit_mental_health_posts")

frames: list[pd.DataFrame] = []
for split_name, split_data in raw.items():
    label = SUBREDDIT_TO_LABEL.get(split_name)
    if label is None:
        continue
    df = split_data.to_pandas()
    # Prefer selftext, fall back to title
    df["text"] = df.get("selftext", df.get("title", "")).fillna("")
    df.loc[df["text"].str.strip() == "", "text"] = df["title"].fillna("")
    df["label"] = LABEL2ID[label]
    df["label_name"] = label
    frames.append(df[["text", "label", "label_name"]])

data_df = pd.concat(frames, ignore_index=True)

# ── 2. Clean & balance ────────────────────────────────────────────────────────
data_df = data_df[data_df["text"].str.len() > 20].copy()
data_df = data_df.drop_duplicates(subset="text").reset_index(drop=True)

# Cap at 10 000 samples per class to avoid severe imbalance
MAX_PER_CLASS = 10_000
balanced = (
    data_df.groupby("label", group_keys=False)
    .apply(lambda g: g.sample(min(len(g), MAX_PER_CLASS), random_state=SEED))
    .reset_index(drop=True)
)

print(f"Dataset size after balancing: {len(balanced):,}")
print(balanced["label_name"].value_counts().to_string())

# ── 3. Train / val / test split ───────────────────────────────────────────────
train_val_df, test_df = train_test_split(balanced, test_size=0.10, stratify=balanced["label"], random_state=SEED)
train_df, val_df      = train_test_split(train_val_df, test_size=0.111, stratify=train_val_df["label"], random_state=SEED)
# ≈ 80 / 10 / 10

print(f"\nSplit sizes  →  train: {len(train_df):,}  val: {len(val_df):,}  test: {len(test_df):,}")

# ── 4. Tokenizer ──────────────────────────────────────────────────────────────
print("\nLoading tokenizer …")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

def tokenize_fn(batch):
    return tokenizer(
        batch["text"],
        truncation=True,
        max_length=MAX_LEN,
        padding=False,   # DataCollatorWithPadding handles dynamic padding
    )

def df_to_hf_dataset(df: pd.DataFrame) -> Dataset:
    ds = Dataset.from_pandas(df[["text", "label"]].reset_index(drop=True))
    return ds.map(tokenize_fn, batched=True, remove_columns=["text"])

train_ds = df_to_hf_dataset(train_df)
val_ds   = df_to_hf_dataset(val_df)
test_ds  = df_to_hf_dataset(test_df)

data_collator = DataCollatorWithPadding(tokenizer)

# ── 5. Model ──────────────────────────────────────────────────────────────────
print("Loading model …")
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=len(LABEL_NAMES),
    id2label=ID2LABEL,
    label2id=LABEL2ID,
)

# ── 6. Metrics ────────────────────────────────────────────────────────────────
accuracy_metric = evaluate.load("accuracy")
f1_metric       = evaluate.load("f1")

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    acc = accuracy_metric.compute(predictions=preds, references=labels)
    f1  = f1_metric.compute(predictions=preds, references=labels, average="weighted")
    return {**acc, **f1}

# ── 7. Training arguments ─────────────────────────────────────────────────────
training_args = TrainingArguments(
    output_dir                  = OUTPUT_DIR,
    num_train_epochs            = NUM_EPOCHS,
    per_device_train_batch_size = BATCH_SIZE,
    per_device_eval_batch_size  = BATCH_SIZE,
    learning_rate               = LEARNING_RATE,
    weight_decay                = 0.01,
    warmup_ratio                = 0.06,
    lr_scheduler_type           = "cosine",
    evaluation_strategy         = "epoch",
    save_strategy               = "epoch",
    load_best_model_at_end      = True,
    metric_for_best_model       = "f1",
    greater_is_better           = True,
    logging_dir                 = f"{OUTPUT_DIR}/logs",
    logging_steps               = 50,
    fp16                        = torch.cuda.is_available(),   # AMP on GPU
    seed                        = SEED,
    report_to                   = "none",   # change to "wandb" if you use W&B
)

# ── 8. Trainer ────────────────────────────────────────────────────────────────
trainer = Trainer(
    model           = model,
    args            = training_args,
    train_dataset   = train_ds,
    eval_dataset    = val_ds,
    tokenizer       = tokenizer,
    data_collator   = data_collator,
    compute_metrics = compute_metrics,
    callbacks       = [EarlyStoppingCallback(early_stopping_patience=2)],
)

# ── 9. Train ──────────────────────────────────────────────────────────────────
print("\nStarting training …")
trainer.train()

# ── 10. Evaluate on held-out test set ─────────────────────────────────────────
print("\nEvaluating on test set …")
test_results  = trainer.predict(test_ds)
test_preds    = np.argmax(test_results.predictions, axis=-1)
test_labels   = test_results.label_ids

print("\nTest set classification report:")
print(
    classification_report(
        test_labels,
        test_preds,
        target_names=LABEL_NAMES,
        digits=4,
    )
)

# ── 11. Save model + tokenizer ────────────────────────────────────────────────
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)

label_map_path = os.path.join(OUTPUT_DIR, "label_mapping.json")
with open(label_map_path, "w") as f:
    json.dump({"id2label": ID2LABEL, "label2id": LABEL2ID}, f, indent=2)

print(f"\nModel saved to: {OUTPUT_DIR}")
print(f"Label mapping : {label_map_path}")
print("\nDone! ✔")
