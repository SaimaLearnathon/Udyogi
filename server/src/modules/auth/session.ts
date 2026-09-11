import { createHash, createHmac, randomBytes } from "node:crypto";
import { env } from "../../config/env.js";

export function emailLookup(email: string) {
  return createHmac("sha256", env.EMAIL_LOOKUP_SECRET).update(email.trim().toLowerCase()).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
