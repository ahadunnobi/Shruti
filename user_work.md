# User Work

This document outlines the final steps and configurations required from your end to get the **Shruti - Mental Health Analysis** application up and running.

## 1. Environment Variables (`.env.local`) Checks & Updates

I have checked the keys you provided. Here is the status of your `.env.local` file:

### ✅ Working / Generated
- **`HUGGINGFACE_API_KEY`**: Working perfectly! Successfully connected to Hugging Face.
- **`ENCRYPTION_KEY`**: ✅ I have automatically generated and added a secure 32-byte hex key for you.
- **`NEXTAUTH_SECRET`**: ✅ I have automatically generated and added a secure NextAuth secret for you.
- **`HF_USERNAME`**: Set to `ahadven`.

### ❌ Needs Your Attention
- **`DATABASE_URL`**: The connection failed (`Can't reach database server`). If this is a Neon database, it might be paused/sleeping. Try waking it up by visiting the Neon console, or double-check the connection string/password.
- **`OPENAI_API_KEY`**: The key currently in the file (`sk-1234uvwxabcd5678...`) is a dummy placeholder. Get a real key from your [OpenAI Dashboard](https://platform.openai.com/api-keys) to enable Voice Transcription.
- **`GOOGLE_CLIENT_ID`** & **`GOOGLE_CLIENT_SECRET`**: Currently set to placeholders. If you want Google Login to work, create these in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and paste them in.

---

## 2. Database Setup

Once your `.env.local` has a valid and reachable `DATABASE_URL`, you need to push the Prisma schema to create the tables.

- Run the following command in your terminal:
  ```bash
  npx prisma migrate dev --name init_and_privacy
  ```

---

## 3. Dependency Installation

The app uses `next-intl` for English/Bengali translations, but it needs to be installed.

- Run the following command in your terminal:
  ```bash
  npm install next-intl
  ```

---

## 4. GitHub Actions CI/CD Secrets (If deploying)

If you plan to push this to GitHub and want the CI/CD pipeline to deploy to Vercel automatically, you need to add the following secrets to your GitHub repository (`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`):

- **`VERCEL_TOKEN`**: Generate a token in your [Vercel Account Settings](https://vercel.com/account/tokens).
- **`VERCEL_ORG_ID`**: Found in `.vercel/project.json` after running `npx vercel link` locally.
- **`VERCEL_PROJECT_ID`**: Found in `.vercel/project.json` after running `npx vercel link` locally.
- **`ENCRYPTION_KEY`**: The same key that is now in your `.env.local`.
- **`NEXTAUTH_SECRET`**: The same secret that is now in your `.env.local`.

---

## 5. Run the Application

Once the database migration and installations are complete, you can start the development server:

- Run the following command:
  ```bash
  npm run dev
  ```
  Then open [http://localhost:3000](http://localhost:3000) in your browser.
