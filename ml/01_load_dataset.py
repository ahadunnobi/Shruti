"""
Prompt 23 — Download & Preview Reddit Mental Health Dataset
============================================================
Dataset : solomonk/reddit_mental_health_posts
Library : datasets (pip install datasets pandas)

Run:
    python ml/01_load_dataset.py
"""

from datasets import load_dataset
import pandas as pd

# ── 1. Download ──────────────────────────────────────────────────────────────
# The dataset has multiple splits mapped to subreddit names.
# We stream=False so the full dataset is cached locally (~200 MB).
print("Downloading dataset from Hugging Face Hub …")
dataset = load_dataset("solomonk/reddit_mental_health_posts")
print(dataset)

# ── 2. Inspect available splits (one per subreddit) ─────────────────────────
print("\nAvailable splits (subreddits):", list(dataset.keys()))

# ── 3. Combine all splits into one DataFrame ─────────────────────────────────
frames = []
for split_name, split_data in dataset.items():
    df = split_data.to_pandas()
    # Normalise the label: use the split name as the subreddit / category
    df["subreddit"] = split_name
    frames.append(df)

full_df = pd.concat(frames, ignore_index=True)

print(f"\nTotal rows across all splits: {len(full_df):,}")
print("Columns:", full_df.columns.tolist())

# ── 4. Preview first 5 rows ──────────────────────────────────────────────────
pd.set_option("display.max_colwidth", 80)
print("\n── First 5 rows ────────────────────────────────────────────────────────")
print(full_df.head(5).to_string(index=False))

# ── 5. Class distribution ────────────────────────────────────────────────────
print("\n── Posts per subreddit ─────────────────────────────────────────────────")
print(full_df["subreddit"].value_counts().to_string())

# ── 6. (Optional) Save to CSV for later use ──────────────────────────────────
out_path = "ml/reddit_mental_health_raw.csv"
full_df.to_csv(out_path, index=False)
print(f"\nSaved full dataset to: {out_path}")
