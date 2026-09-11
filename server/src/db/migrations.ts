import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Queryable } from "./queryable.js";

export async function runMigrations(db: Queryable, migrationsDir = join(process.cwd(), "migrations")) {
  await db.query("create table if not exists schema_migrations (filename text primary key, applied_at timestamptz not null default now())");
  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const applied = await db.query("select filename from schema_migrations where filename = $1", [file]);
    if (applied.rowCount) continue;

    const sql = await readFile(join(migrationsDir, file), "utf8");
    await db.query("begin");
    try {
      await db.query(sql);
      await db.query("insert into schema_migrations (filename) values ($1)", [file]);
      await db.query("commit");
    } catch (error) {
      await db.query("rollback");
      throw error;
    }
  }
}
