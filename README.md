# 🧠 Shruti — AI Mental Health Analysis Platform

> **Medical Disclaimer:** Shruti is an informational tool only. It is **not** a substitute for professional medical diagnosis, treatment, or advice. If you are in crisis, please contact a mental health professional or call your local helpline immediately (e.g., **iCall: 9152987821** · **Vandrevala Foundation: 1860-2662-345** · **International: findahelpline.com**).

---

## Overview

Shruti is a full-stack Next.js 14 application that helps users reflect on their mental health through AI-powered text and voice journaling. Users write or speak freely; Shruti classifies the entry into one of five categories — **Depression, Anxiety, PTSD, Stress, or Neutral** — and tracks weekly trends over time.

Key capabilities:

| Feature | Description |
|---|---|
| Text journaling | Free-form journal with auto-save; emotion scoring via Hugging Face |
| Voice recording | Browser MediaRecorder → OpenAI Whisper transcript → emotion analysis |
| Custom AI model | Fine-tuned DistilBERT on `solomonk/reddit_mental_health_posts` |
| Dashboard | 7-day rolling averages, trend arrows, lifestyle correlations |
| History timeline | Filterable analysis history with Chart.js trend lines |
| Crisis detection | Keyword gate that shows helpline resources before analysis |
| Privacy controls | AES-256-GCM encrypted storage, data export, account deletion |
| i18n | English and Bengali (বাংলা) via `next-intl` |
| CI/CD | GitHub Actions → ESLint + Jest → Vercel production deploy |

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — utility-first styling
- **Chart.js + react-chartjs-2** — trend charts
- **next-intl** — i18n (English / Bengali)
- **next-themes** — dark / light mode

### Backend
- **Next.js API Routes** — serverless endpoints
- **NextAuth.js v4** — email/password + Google OAuth
- **Prisma ORM** — type-safe database access
- **PostgreSQL** — persistent storage
- **Node.js `crypto`** — AES-256-GCM field encryption

### AI / ML
- **Hugging Face Inference API** — default emotion model (`j-hartmann/emotion-english-distilroberta-base`)
- **Custom fine-tuned model** — DistilBERT trained on Reddit Mental Health Dataset
- **OpenAI Whisper** — voice → text transcription
- **Python FastAPI microservice** — vocal stress scoring (librosa)

### DevOps
- **GitHub Actions** — CI (lint + test + build) on every push
- **Vercel** — production deployment on merge to `main`

---

## Running Locally

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (local or [Supabase free tier](https://supabase.com))
- A Hugging Face account and API key

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/shruti.git
cd shruti

# 2. Install Node dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.local.example .env.local   # see Environment Variables below

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: Python vocal-stress microservice
```bash
cd services/vocal-tone
pip install fastapi uvicorn librosa python-multipart
uvicorn main:app --reload --port 8000
```

### Optional: Train / update the custom AI model
```bash
pip install "transformers[torch]" datasets scikit-learn accelerate evaluate huggingface_hub
python ml/01_load_dataset.py   # download & preview dataset
python ml/02_train_model.py    # fine-tune DistilBERT (~20 min on GPU)
python ml/03_push_to_hub.py    # push to Hugging Face Hub
# Then create an Inference Endpoint at ui.endpoints.huggingface.co
# and set CUSTOM_HF_MODEL_URL in .env.local
```

---

## Environment Variables

Create a `.env.local` file in the project root. All variables marked **required** must be set before the app will start.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random secret for NextAuth session signing |
| `NEXTAUTH_URL` | ✅ | Public base URL (e.g., `http://localhost:3000`) |
| `HUGGINGFACE_API_KEY` | ✅ | Hugging Face API token |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `OPENAI_API_KEY` | ✅ | OpenAI API key (for Whisper transcription) |
| `ENCRYPTION_KEY` | ✅ | 64-char hex string — AES-256 key for stored text |
| `VOCAL_TONE_API_URL` | ✅ | URL of the Python vocal-stress microservice |
| `CUSTOM_HF_MODEL_URL` | ⬜ | Hugging Face Inference Endpoint URL (custom model) |
| `HF_USERNAME` | ⬜ | Your Hugging Face username (for `ml/03_push_to_hub.py`) |

Generate `ENCRYPTION_KEY`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Dataset Sources

| Dataset | Type | Source |
|---|---|---|
| `solomonk/reddit_mental_health_posts` | Text (Reddit posts) | [huggingface.co/datasets](https://huggingface.co/datasets/solomonk/reddit_mental_health_posts) |
| `Amod/mental_health_counseling_conversations` | Text (Q&A) | [huggingface.co/datasets](https://huggingface.co/datasets/Amod/mental_health_counseling_conversations) |
| `heliosbrahma/mental_health_chatbot_dataset` | Chatbot text | [huggingface.co/datasets](https://huggingface.co/datasets/heliosbrahma/mental_health_chatbot_dataset) |
| DAIC-WOZ | Voice + text | [dcapswoz.ict.usc.edu](http://dcapswoz.ict.usc.edu/) (apply for access) |
| RAVDESS | Voice emotions | [zenodo.org](https://zenodo.org/record/1188976) (free download) |
| SentimentMH | Twitter text | [kaggle.com](https://www.kaggle.com/) |

> All datasets are used for research and informational purposes only. Please review each dataset's licence before commercial use.

---

## Project Structure

```
shruti/
├── app/
│   ├── (dashboard)/dashboard/   # Main dashboard, journal, history, voice, settings
│   ├── api/
│   │   ├── analyze/text/        # Text analysis route (Prompts 7 & 25)
│   │   ├── analyze/voice/       # Voice transcription route
│   │   ├── lifestyle/           # Lifestyle input API
│   │   └── privacy/             # Export / delete / toggle (Prompt 27)
│   └── auth/                    # NextAuth sign-in / sign-up pages
├── components/
│   ├── dashboard/               # Score cards, charts, lifestyle form
│   ├── i18n/                    # LanguageSwitcher component
│   ├── layout/                  # Sidebar, TopNav
│   └── onboarding/              # First-login modal with disclaimer
├── i18n/
│   └── request.ts               # next-intl locale resolver
├── lib/
│   ├── analysis.ts              # Emotion → category mapping, crisis detection
│   ├── encryption.ts            # AES-256-GCM encrypt / decrypt helpers
│   ├── env.ts                   # Type-safe env var access
│   ├── auth.ts                  # NextAuth config
│   └── prisma.ts                # Prisma client singleton
├── messages/
│   ├── en.json                  # English translations
│   └── bn.json                  # Bengali translations
├── ml/
│   ├── 01_load_dataset.py       # Download & preview Reddit MH dataset
│   ├── 02_train_model.py        # Fine-tune DistilBERT
│   └── 03_push_to_hub.py        # Push model to Hugging Face Hub
├── prisma/
│   └── schema.prisma            # Database schema
├── services/
│   └── vocal-tone/              # Python FastAPI vocal-stress microservice
└── .github/
    └── workflows/
        └── ci-cd.yml            # GitHub Actions CI/CD pipeline
```

---

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:migrate   # Run pending database migrations
```

---

## Contributing

Pull requests are welcome. Please open an issue first for major changes. All contributions must pass ESLint and the Jest test suite (`npm run lint && npx jest`).

---

## Licence

MIT © 2026 Shruti Contributors

---

> ⚠ **Medical Disclaimer (repeated for prominence):** Shruti is an informational tool only and is **not** a medical device. It does not provide diagnosis, treatment, or clinical advice. Always consult a qualified mental health professional. If you or someone you know is in immediate danger, call emergency services in your country.
