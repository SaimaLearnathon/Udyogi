import "dotenv/config";

export const env = {
  HOST: process.env.HOST ?? "0.0.0.0",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/uddogi",
  SESSION_SECRET: process.env.SESSION_SECRET ?? "development-session-secret",
  EMAIL_LOOKUP_SECRET: process.env.EMAIL_LOOKUP_SECRET ?? "development-email-secret",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite"
};
