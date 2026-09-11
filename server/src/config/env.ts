export const env = {
  HOST: process.env.HOST ?? "0.0.0.0",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/uddogi",
  SESSION_SECRET: process.env.SESSION_SECRET ?? "development-session-secret",
  EMAIL_LOOKUP_SECRET: process.env.EMAIL_LOOKUP_SECRET ?? "development-email-secret"
};
