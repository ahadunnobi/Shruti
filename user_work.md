# User Work

This document outlines the final steps and configurations required from your end to get the **Shruti - Mental Health Analysis** application up and running.

## 1. Environment Variables (`.env.local`)

You need to fill in the missing values in your `.env.local` file. Here is the checklist:

### AI APIs
- [ ] `HUGGINGFACE_API_KEY`: Get this from your [Hugging Face Settings](https://huggingface.co/settings/tokens). It is required for the default emotion analysis model.
- [ ] `OPENAI_API_KEY`: Get this from your [OpenAI Dashboard](https://platform.openai.com/api-keys). It is required for Whisper (voice transcription).

### Authentication (NextAuth)
- [ ] `NEXTAUTH_SECRET`: A random string used to sign session cookies. You can generate one by running `openssl rand -base64 32` in your terminal, or use any online generator.
- [ ] `GOOGLE_CLIENT_ID`: Required for Google Login. Create this in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
- [ ] `GOOGLE_CLIENT_SECRET`: Required for Google Login. Also from the Google Cloud Console.

### Security
- [ ] `ENCRYPTION_KEY`: A 64-character (32-byte) hex string used for AES-256-GCM encryption of user journal entries.
  - **How to generate:** Run this command in your terminal and copy the output:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```

### Optional (If deploying custom AI model)
- [ ] `CUSTOM_HF_MODEL_URL`: After running `ml/03_push_to_hub.py` and creating an Inference Endpoint on Hugging Face, paste the URL here.

---

## 2. Database Setup

Once your `.env.local` has a valid `DATABASE_URL` (currently set to a local Postgres database), you need to push the Prisma schema to create the tables.

- [ ] Run the following command in your terminal:
  ```bash
  npx prisma migrate dev --name init_and_privacy
  ```

---

## 3. Dependency Installation

The previous step added `next-intl` for translations, but it needs to be installed.

- [ ] Run the following command in your terminal:
  ```bash
  npm install next-intl
  ```

---

## 4. GitHub Actions CI/CD Secrets (If deploying)

If you plan to push this to GitHub and want the CI/CD pipeline (Prompt 29) to deploy to Vercel automatically, you need to add the following secrets to your GitHub repository (`Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`):

- [ ] `VERCEL_TOKEN`: Generate a token in your [Vercel Account Settings](https://vercel.com/account/tokens).
- [ ] `VERCEL_ORG_ID`: Found in `.vercel/project.json` after running `npx vercel link` locally.
- [ ] `VERCEL_PROJECT_ID`: Found in `.vercel/project.json` after running `npx vercel link` locally.
- [ ] `ENCRYPTION_KEY`: The same key you generated for `.env.local`.
- [ ] `NEXTAUTH_SECRET`: The same secret you generated for `.env.local`.

---

## 5. Run the Application

Once the above steps are complete, you can start the development server:

- [ ] Run the following command:
  ```bash
  npm run dev
  ```
  Then open [http://localhost:3000](http://localhost:3000) in your browser.
