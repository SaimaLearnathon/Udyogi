import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("initial schema includes required core tables", async () => {
  const sql = await readFile("migrations/001_initial_schema.sql", "utf8");

  for (const table of ["users", "consultant_sessions", "theses", "published_listings", "match_scores", "messages", "model_calls"]) {
    assert.match(sql, new RegExp(`create table if not exists ${table}`));
  }
});
