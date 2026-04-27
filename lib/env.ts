const requiredEnvVars = [
  "HUGGINGFACE_API_KEY",
  "OPENAI_API_KEY",
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET"
] as const;

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    // Fail fast in development so missing secrets are obvious.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`Missing environment variable: ${key}`);
    }
  }
}

export const env = {
  huggingFaceApiKey: process.env.HUGGINGFACE_API_KEY ?? "",
  openAiApiKey: process.env.OPENAI_API_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  nextAuthSecret: process.env.NEXTAUTH_SECRET ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
};
