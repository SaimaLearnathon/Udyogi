import { pool } from "./pool.js";
import { runMigrations } from "./migrations.js";

await runMigrations(pool);
await pool.end();
