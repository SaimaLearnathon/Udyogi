import { createHash, createHmac, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../config/env.js";
import type { Queryable } from "../../db/queryable.js";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Availability = "full_time" | "part_time" | "advisor";
export type LocationPrecision = "exact" | "city" | "region";

export interface UserRow {
  id: string;
  public_name: string;
  public_bio: string;
  is_founder: boolean;
  is_seeker: boolean;
  availability: Availability;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  portfolio_url: string | null;
  contribution_count: number;
  success_rate: number | null;
  eligibility: string;
}

export interface PublicUser {
  id: string;
  publicName: string;
  publicBio: string;
  isFounder: boolean;
  isSeeker: boolean;
  availability: Availability;
  field: string | null;
  skills: string[];
  interests: string[];
  location: {
    city: string | null;
    region: string | null;
    country: string | null;
  };
  socials: {
    linkedinUrl: string | null;
    facebookUrl: string | null;
    portfolioUrl: string | null;
  };
  contributionCount: number;
  successRate: number | null;
  eligibility: string;
}

export function emailLookup(email: string) {
  return createHmac("sha256", env.EMAIL_LOOKUP_SECRET).update(email.trim().toLowerCase()).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function toPublicUser(row: UserRow, related: { field: string | null; skills: string[]; interests: string[] }): PublicUser {
  return {
    id: row.id,
    publicName: row.public_name,
    publicBio: row.public_bio,
    isFounder: row.is_founder,
    isSeeker: row.is_seeker,
    availability: row.availability,
    field: related.field,
    skills: related.skills,
    interests: related.interests,
    location: {
      city: row.location_city,
      region: row.location_region,
      country: row.location_country
    },
    socials: {
      linkedinUrl: row.linkedin_url,
      facebookUrl: row.facebook_url,
      portfolioUrl: row.portfolio_url
    },
    contributionCount: row.contribution_count,
    successRate: row.success_rate,
    eligibility: row.eligibility
  };
}

export async function createSession(db: Queryable, userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.query("insert into auth_sessions (user_id, token_hash, expires_at) values ($1, $2, $3)", [userId, tokenHash, expiresAt]);
  return token;
}

export async function findUserIdBySessionToken(db: Queryable, token: string) {
  const tokenHash = hashSessionToken(token);
  const result = await db.query<{ user_id: string }>(
    "select user_id from auth_sessions where token_hash = $1 and revoked_at is null and expires_at > now()",
    [tokenHash]
  );
  return result.rows[0]?.user_id ?? null;
}

export async function revokeSession(db: Queryable, token: string) {
  const tokenHash = hashSessionToken(token);
  await db.query("update auth_sessions set revoked_at = now() where token_hash = $1 and revoked_at is null", [tokenHash]);
}

export async function requireUserId(request: FastifyRequest, reply: FastifyReply, db: Queryable): Promise<string | null> {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;

  if (!token) {
    reply.code(401).send({ message: "অনুমোদন প্রয়োজন" });
    return null;
  }

  const userId = await findUserIdBySessionToken(db, token);
  if (!userId) {
    reply.code(401).send({ message: "সেশন মেয়াদোত্তীর্ণ বা বাতিল হয়েছে, আবার লগইন করুন" });
    return null;
  }

  return userId;
}
