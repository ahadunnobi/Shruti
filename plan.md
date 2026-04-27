# 30-Prompt Roadmap: Mental Health Analysis App (Next.js)

A step-by-step list of prompts to give Claude (or any AI) to build your full mental health analysis platform.

---

## Phase 1 — Project Setup (Prompts 1–5)

**Prompt 1**
> "Create a new Next.js 14 project with TypeScript, Tailwind CSS, and App Router. Show me the full folder structure for a mental health analysis app."

**Prompt 2**
> "Set up a `.env.local` file with placeholders for my Hugging Face API key, OpenAI API key, and database URL. Also configure next.config.js for environment variables."

**Prompt 3**
> "Set up Prisma ORM with PostgreSQL. Write a schema with tables for: users, sessions, analysis_results (text, emotion scores, timestamp), and voice_entries."

**Prompt 4**
> "Integrate NextAuth.js into my Next.js app with email/password login and Google OAuth. Show me the auth config and a protected route middleware."

**Prompt 5**
> "Build a base layout with a sidebar, top navigation, and dark/light mode toggle using Tailwind CSS. Make it mobile responsive."

---

## Phase 2 — Text Analysis (Prompts 6–10)

**Prompt 6**
> "Create a journal input page at `/dashboard/journal`. It should have a textarea, a submit button, and auto-save every 30 seconds using localStorage."

**Prompt 7**
> "Write a Next.js API route at `/api/analyze/text` that takes a user's text and sends it to the Hugging Face Inference API using the `j-hartmann/emotion-english-distilroberta-base` model. Return the emotion scores."

**Prompt 8**
> "Using the Hugging Face results (emotions like sadness, fear, anger), write a function that maps them to mental health categories: Depression, Anxiety, Stress, or Neutral. Include the mapping logic."

**Prompt 9**
> "Add a crisis detection layer to my text analysis API. Scan for red-flag keywords related to self-harm. If detected, return a `crisis: true` flag and stop analysis. Show how to display a helpline modal in the frontend."

**Prompt 10**
> "After analysis, save the result to PostgreSQL using Prisma. Store: userId, inputText, emotionScores (JSON), category, timestamp. Write the Prisma query and the API handler."

---

## Phase 3 — Results UI (Prompts 11–13)

**Prompt 11**
> "Build a result card component that shows the detected mental health category (Depression/Anxiety/Stress/Neutral) with a color-coded badge and a bar chart of emotion scores using Chart.js."

**Prompt 12**
> "Create a disclaimer banner component that shows: 'This is not a medical diagnosis. Please consult a professional.' Make it appear on every analysis result page."

**Prompt 13**
> "Build an onboarding modal that appears on first login. It should explain what the app does, show the medical disclaimer, and ask for user consent before saving any data."

---

## Phase 4 — Voice Input (Prompts 14–18)

**Prompt 14**
> "Build a voice recorder component using the browser's MediaRecorder API. It should show a waveform animation while recording and allow the user to stop and replay the recording."

**Prompt 15**
> "Write a Next.js API route at `/api/analyze/voice` that accepts an audio file upload (webm/mp3), sends it to the OpenAI Whisper API, and returns the transcript text."

**Prompt 16**
> "Once I have the transcript from Whisper, pipe it through my existing `/api/analyze/text` route to get the emotion and mental health category. Show me how to chain these two API calls."

**Prompt 17**
> "Add vocal tone analysis to my voice route. Using a Python FastAPI microservice (give me the Python code), extract pitch and speech rate from the audio using librosa and return a stress score."

**Prompt 18**
> "Build a 'discrepancy alert' — if the text says positive emotions but the vocal tone score says high stress, show a yellow warning card: 'Your voice suggests you may be feeling more stressed than your words indicate.'"

---

## Phase 5 — Dashboard & History (Prompts 19–22)

**Prompt 19**
> "Build a history page at `/dashboard/history` that fetches all past analysis results for the logged-in user from PostgreSQL and displays them in a timeline. Include filter by date and category."

**Prompt 20**
> "Add a weekly mood trend line chart using Chart.js. Pull the last 7 days of depression/anxiety/stress scores from the database and plot them as separate lines."

**Prompt 21**
> "Create a 'Mental Health Score' summary card on the dashboard that shows a rolling 7-day average score per category (Depression, Anxiety, Stress) with up/down trend arrows."

**Prompt 22**
> "Add a lifestyle input form with sliders for: sleep hours, physical activity (1–10), social interactions (1–10). Save to database and show a correlation tip like 'Low sleep is linked to your high anxiety score this week.'"

---

## Phase 6 — Datasets & AI Training (Prompts 23–25)

**Prompt 23**
> "Show me how to download the Reddit Mental Health Dataset from Hugging Face (`solomonk/reddit_mental_health_posts`) and load it in Python using the `datasets` library. Preview the first 5 rows."

**Prompt 24**
> "Fine-tune a `distilbert-base-uncased` model on the Reddit Mental Health Dataset to classify text into: Depression, Anxiety, PTSD, Stress, Neutral. Give me the full Python training script using Hugging Face Transformers."

**Prompt 25**
> "Deploy my fine-tuned Hugging Face model as an Inference Endpoint. Then update my Next.js `/api/analyze/text` route to call this custom model instead of the default one."

---

## Phase 7 — Privacy, Security & Launch (Prompts 26–30)

**Prompt 26**
> "Add AES-256 encryption for stored user text inputs in PostgreSQL. Show me how to encrypt before saving and decrypt when reading, using Node.js `crypto` module."

**Prompt 27**
> "Build a privacy settings page where users can: delete all their data, export their history as JSON, and toggle whether voice recordings are saved."

**Prompt 28**
> "Add i18n (internationalization) to my Next.js app using `next-intl`. Set up English and Bengali language support. Show me how to translate the main dashboard page."

**Prompt 29**
> "Write a GitHub Actions CI/CD workflow that: runs ESLint and Jest tests on every push, and deploys to Vercel automatically on merge to main."

**Prompt 30**
> "Write a complete README.md for my mental health analysis app. Include: project overview, tech stack, how to run locally, environment variables needed, dataset sources, and the medical disclaimer."

---

## Open-Source Datasets to Use

| Dataset | Type | Where to Get |
|---|---|---|
| `solomonk/reddit_mental_health_posts` | Text | huggingface.co/datasets |
| `Amod/mental_health_counseling_conversations` | Text (Q&A) | huggingface.co/datasets |
| `heliosbrahma/mental_health_chatbot_dataset` | Chatbot text | huggingface.co/datasets |
| DAIC-WOZ | Voice + text | dcapswoz.ict.usc.edu (apply) |
| RAVDESS | Voice emotions | zenodo.org (free) |
| SentimentMH | Twitter text | kaggle.com |

---

> **Disclaimer:** This app is an informational tool only. It is not a substitute for professional medical diagnosis or treatment. Always include crisis helpline links for users in distress.
