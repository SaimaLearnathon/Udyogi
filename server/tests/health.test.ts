import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../src/app.js";

test("health route responds", async () => {
  const app = buildApp();
  const response = await app.inject({ method: "GET", url: "/api/health" });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().ok, true);
});
