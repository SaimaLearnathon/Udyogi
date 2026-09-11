import assert from "node:assert/strict";
import test from "node:test";
import { emailLookup, hashSessionToken } from "../src/modules/auth/session.js";

test("email lookup is normalized and deterministic", () => {
  assert.equal(emailLookup("USER@example.com"), emailLookup(" user@example.com "));
});

test("session token hash does not expose token", () => {
  const token = "sample-token";
  assert.notEqual(hashSessionToken(token), token);
});
