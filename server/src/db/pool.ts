import pg from "pg";
import { env } from "../config/env.js";

const isLocalDb = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  // hosted Postgres (Render, Neon, Supabase, ...) requires SSL with a self-signed cert
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false }
});
