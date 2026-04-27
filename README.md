# Mental Health Analysis Platform

A Next.js 14 application for analyzing journal text with AI-powered emotion detection, mental health category mapping, and crisis keyword flagging.

This project is privacy-conscious and built as a staged platform, with core text-analysis flow implemented and additional roadmap items (voice pipeline, richer dashboard analytics, and training workflows) planned.

## Features

- Journal entry input with autosave to local storage every 30 seconds.
- Text emotion inference through the Hugging Face model `j-hartmann/emotion-english-distilroberta-base`.
- Category mapping into:
  - `Depression`
  - `Anxiety`
  - `Stress`
  - `Neutral`
- Crisis keyword detection with immediate support modal.
- Result persistence to PostgreSQL via Prisma.
- Authentication via NextAuth:
  - Email/password (credentials)
  - Google OAuth
- Dashboard shell pages for history, settings, and trend sections.
- Dark/light theme support.

## Tech Stack

- `Next.js 14` (App Router)
- `TypeScript`
- `Tailwind CSS`
- `Prisma ORM`
- `PostgreSQL`
- `NextAuth.js`
- `Chart.js` + `react-chartjs-2`

## Project Structure

```text
app/
  api/
    analyze/
      text/route.ts
  (dashboard)/
    dashboard/
      journal/page.tsx
      history/page.tsx
      settings/page.tsx
lib/
  auth.ts
  env.ts
prisma/
  schema.prisma
components/
  analysis/
  layout/
```

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm
- PostgreSQL database
- API keys for Hugging Face, OpenAI, and Google OAuth

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create/update environment file:

   - Use `.env.local` in the project root.
   - Fill in real values for all required variables listed below.

3. Generate Prisma client:

   ```bash
   npm run prisma:generate
   ```

4. Apply database migration(s):

   ```bash
   npm run prisma:migrate
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

The app reads these values from `.env.local`:

```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/mental_health_db

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VOCAL_TONE_API_URL=http://localhost:8000/analyze-tone
```

## Available Scripts

- `npm run dev` - Run development server.
- `npm run build` - Build for production.
- `npm run start` - Start production server.
- `npm run lint` - Run ESLint checks.
- `npm run prisma:generate` - Generate Prisma client.
- `npm run prisma:migrate` - Run Prisma development migration.

## Current API Endpoints

- `POST /api/analyze/text`
  - Requires authenticated user session.
  - Accepts text input.
  - Runs crisis detection first.
  - Calls Hugging Face for emotion scores.
  - Maps output to mental health category.
  - Saves result in `analysis_results`.

## Database Models

Defined in `prisma/schema.prisma`:

- `User`
- `Session`
- `Account`
- `VerificationToken`
- `AnalysisResult`
- `VoiceEntry`

## Roadmap Highlights

Planned/in-progress areas include:

- Voice upload and transcription flow.
- Vocal tone stress analysis service integration.
- Weekly trend and score visualizations on dashboard.
- Data export and privacy controls.
- Fine-tuned custom mental health classification model support.

## Dataset Sources

Potential datasets referenced for model training and experimentation:

- [solomonk/reddit_mental_health_posts](https://huggingface.co/datasets/solomonk/reddit_mental_health_posts)
- [Amod/mental_health_counseling_conversations](https://huggingface.co/datasets/Amod/mental_health_counseling_conversations)
- [heliosbrahma/mental_health_chatbot_dataset](https://huggingface.co/datasets/heliosbrahma/mental_health_chatbot_dataset)
- [DAIC-WOZ](https://dcapswoz.ict.usc.edu/)
- [RAVDESS](https://zenodo.org/record/1188976)
- [SentimentMH](https://www.kaggle.com/)

## Medical Disclaimer

This application is an informational support tool and **not** a medical diagnosis system.  
It must not replace licensed clinical evaluation, emergency intervention, or professional treatment.

If a user appears to be in immediate danger, prompt them to contact local emergency services or crisis hotlines right away.
