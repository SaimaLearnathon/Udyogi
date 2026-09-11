import type { FastifyInstance } from "fastify";
import type { PoolClient } from "pg";
import { pool } from "../../db/pool.js";
import type { Queryable } from "../../db/queryable.js";
import { normalizeBengaliText } from "../../utils/text.js";
import { hashPassword, verifyPassword } from "./password.js";
import {
  createSession,
  emailLookup,
  requireUserId,
  revokeSession,
  toPublicUser,
  type Availability,
  type LocationPrecision,
  type PublicUser,
  type UserRow
} from "./session.js";

const AVAILABILITIES: Availability[] = ["full_time", "part_time", "advisor"];
const PRECISIONS: LocationPrecision[] = ["exact", "city", "region"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ProfileInput {
  publicName: string;
  publicBio: string;
  isFounder: boolean;
  isSeeker: boolean;
  availability: Availability;
  location: { city: string; region: string; country: string };
  field: string;
  precision: LocationPrecision;
  skills: string[];
  interests: string;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  portfolioUrl: string | null;
  contributionCount: number;
  successRate: number | null;
  eligibility: string;
}

function validateProfileInput(body: unknown): { errors: string[]; value: ProfileInput | null } {
  const errors: string[] = [];
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  if (typeof b.publicName !== "string" || !b.publicName.trim()) errors.push("পাবলিক নাম আবশ্যক");
  if (typeof b.publicBio !== "string") errors.push("সংক্ষিপ্ত পরিচিতি সঠিক নয়");
  if (typeof b.isFounder !== "boolean") errors.push("প্রতিষ্ঠাতা কিনা তা নির্বাচন করুন");
  if (typeof b.isSeeker !== "boolean") errors.push("টিমমেট খুঁজছেন কিনা তা নির্বাচন করুন");
  if (!AVAILABILITIES.includes(b.availability as Availability)) errors.push("প্রাপ্যতা সঠিকভাবে নির্বাচন করুন");
  if (!PRECISIONS.includes(b.precision as LocationPrecision)) errors.push("লোকেশন নির্ভুলতা সঠিকভাবে নির্বাচন করুন");
  if (typeof b.field !== "string" || !b.field.trim()) errors.push("ক্ষেত্র নির্বাচন আবশ্যক");
  if (!Array.isArray(b.skills) || !b.skills.every((skill) => typeof skill === "string")) errors.push("দক্ষতার তালিকা সঠিক নয়");
  if (typeof b.interests !== "string") errors.push("আগ্রহের তথ্য সঠিক নয়");

  const location = b.location as Record<string, unknown> | undefined;
  if (typeof location !== "object" || location === null) {
    errors.push("লোকেশন তথ্য আবশ্যক");
  } else {
    if (typeof location.city !== "string") errors.push("শহর সঠিক নয়");
    if (typeof location.region !== "string") errors.push("বিভাগ সঠিক নয়");
    if (typeof location.country !== "string") errors.push("দেশ সঠিক নয়");
  }

  const optionalUrlFields = ["linkedinUrl", "facebookUrl", "portfolioUrl"] as const;
  for (const key of optionalUrlFields) {
    if (b[key] !== undefined && b[key] !== null && typeof b[key] !== "string") {
      errors.push("সঠিক লিংক দিন");
    }
  }
  if (b.contributionCount !== undefined && (typeof b.contributionCount !== "number" || b.contributionCount < 0)) {
    errors.push("অবদানের সংখ্যা সঠিক নয়");
  }
  if (
    b.successRate !== undefined &&
    b.successRate !== null &&
    (typeof b.successRate !== "number" || b.successRate < 0 || b.successRate > 100)
  ) {
    errors.push("সাফল্যের হার ০-১০০ এর মধ্যে হতে হবে");
  }
  if (b.eligibility !== undefined && typeof b.eligibility !== "string") {
    errors.push("যোগ্যতার তথ্য সঠিক নয়");
  }

  if (errors.length) return { errors, value: null };

  const loc = location as Record<string, string>;
  const toOptionalUrl = (raw: unknown) => {
    const text = typeof raw === "string" ? raw.trim() : "";
    return text ? text : null;
  };

  return {
    errors: [],
    value: {
      publicName: normalizeText(b.publicName as string),
      publicBio: normalizeText(b.publicBio as string),
      isFounder: b.isFounder as boolean,
      isSeeker: b.isSeeker as boolean,
      availability: b.availability as Availability,
      location: {
        city: normalizeText(loc.city),
        region: normalizeText(loc.region),
        country: normalizeText(loc.country)
      },
      field: normalizeText(b.field as string),
      precision: b.precision as LocationPrecision,
      skills: (b.skills as string[]).map(normalizeText).filter(Boolean),
      interests: normalizeText(b.interests as string),
      linkedinUrl: toOptionalUrl(b.linkedinUrl),
      facebookUrl: toOptionalUrl(b.facebookUrl),
      portfolioUrl: toOptionalUrl(b.portfolioUrl),
      contributionCount: typeof b.contributionCount === "number" ? Math.round(b.contributionCount) : 0,
      successRate: typeof b.successRate === "number" ? Math.round(b.successRate) : null,
      eligibility: normalizeText(typeof b.eligibility === "string" ? b.eligibility : "")
    }
  };
}

function normalizeText(text: string): string {
  return normalizeBengaliText(text);
}

function validateCredentials(body: unknown): { errors: string[]; email: string; password: string } {
  const errors: string[] = [];
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";

  if (!email || !EMAIL_PATTERN.test(email)) errors.push("সঠিক ইমেইল দিন");
  if (password.length < 8) errors.push("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");

  return { errors, email, password };
}

async function findFieldId(db: Queryable, fieldLabel: string) {
  const result = await db.query<{ id: string }>("select id from field_taxonomy where label_bn = $1", [fieldLabel]);
  return result.rows[0]?.id ?? null;
}

async function syncUserField(client: PoolClient, userId: string, fieldLabel: string) {
  const fieldId = await findFieldId(client, fieldLabel);
  if (!fieldId) return false;
  await client.query("delete from user_fields where user_id = $1", [userId]);
  await client.query("insert into user_fields (user_id, field_id) values ($1, $2)", [userId, fieldId]);
  return true;
}

async function syncUserSkills(client: PoolClient, userId: string, skills: string[]) {
  await client.query("delete from user_skills where user_id = $1", [userId]);
  await client.query("delete from user_custom_skills where user_id = $1", [userId]);

  for (const skill of skills) {
    const taxonomy = await client.query<{ id: string }>("select id from skill_taxonomy where label_bn = $1", [skill]);
    const skillId = taxonomy.rows[0]?.id;
    if (skillId) {
      await client.query("insert into user_skills (user_id, skill_id) values ($1, $2) on conflict do nothing", [userId, skillId]);
    } else {
      await client.query(
        "insert into user_custom_skills (user_id, label, normalized_label) values ($1, $2, $3) on conflict (user_id, normalized_label) do nothing",
        [userId, skill, skill.toLowerCase()]
      );
    }
  }
}

async function syncUserInterests(client: PoolClient, userId: string, interestsText: string) {
  await client.query("delete from user_interests where user_id = $1", [userId]);
  const tokens = [...new Set(interestsText.split(",").map((token) => token.trim()).filter(Boolean))];

  for (const token of tokens) {
    const result = await client.query<{ id: string }>("select id from interest_taxonomy where label_bn = $1", [token]);
    const interestId = result.rows[0]?.id;
    if (interestId) {
      await client.query("insert into user_interests (user_id, interest_id) values ($1, $2) on conflict do nothing", [userId, interestId]);
    }
  }
}

async function loadUserRelations(db: Queryable, userId: string) {
  const [skillRows, customSkillRows, interestRows, fieldRows] = await Promise.all([
    db.query<{ label_bn: string }>(
      "select st.label_bn from user_skills us join skill_taxonomy st on st.id = us.skill_id where us.user_id = $1 order by st.label_bn",
      [userId]
    ),
    db.query<{ label: string }>("select label from user_custom_skills where user_id = $1 order by label", [userId]),
    db.query<{ label_bn: string }>(
      "select it.label_bn from user_interests ui join interest_taxonomy it on it.id = ui.interest_id where ui.user_id = $1 order by it.label_bn",
      [userId]
    ),
    db.query<{ label_bn: string }>(
      "select ft.label_bn from user_fields uf join field_taxonomy ft on ft.id = uf.field_id where uf.user_id = $1 limit 1",
      [userId]
    )
  ]);

  return {
    skills: [...skillRows.rows.map((row) => row.label_bn), ...customSkillRows.rows.map((row) => row.label)],
    interests: interestRows.rows.map((row) => row.label_bn),
    field: fieldRows.rows[0]?.label_bn ?? null
  };
}

const userColumns = `id, public_name, public_bio, is_founder, is_seeker, availability, location_city, location_region, location_country,
  linkedin_url, facebook_url, portfolio_url, contribution_count, success_rate, eligibility`;

async function findUserById(db: Queryable, userId: string) {
  const result = await db.query<UserRow>(`select ${userColumns} from users where id = $1`, [userId]);
  return result.rows[0] ?? null;
}

async function findUserByEmail(db: Queryable, email: string) {
  const result = await db.query<UserRow & { password_hash: string }>(
    `select ${userColumns}, password_hash from users where email_lookup = $1`,
    [emailLookup(email)]
  );
  return result.rows[0] ?? null;
}

async function buildPublicUser(db: Queryable, row: UserRow): Promise<PublicUser> {
  const related = await loadUserRelations(db, row.id);
  return toPublicUser(row, related);
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (request, reply) => {
    const credentials = validateCredentials(request.body);
    const profile = validateProfileInput(request.body);
    const errors = [...credentials.errors, ...profile.errors];

    if (errors.length || !profile.value) {
      return reply.code(400).send({ message: errors[0], errors });
    }

    const existing = await pool.query("select id from users where email_lookup = $1", [emailLookup(credentials.email)]);
    if (existing.rowCount) {
      return reply.code(409).send({ message: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে" });
    }

    const value = profile.value;
    const hasLocation = Boolean(value.location.city || value.location.region || value.location.country);
    const client = await pool.connect();

    try {
      await client.query("begin");

      const inserted = await client.query<{ id: string }>(
        `insert into users (
           email_lookup, email_ciphertext, password_hash, public_name, public_bio,
           is_founder, is_seeker, availability,
           location_city, location_region, location_country, location_precision, location_consent_at,
           linkedin_url, facebook_url, portfolio_url, contribution_count, success_rate, eligibility
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         returning id`,
        [
          emailLookup(credentials.email),
          credentials.email,
          hashPassword(credentials.password),
          value.publicName,
          value.publicBio,
          value.isFounder,
          value.isSeeker,
          value.availability,
          value.location.city || null,
          value.location.region || null,
          value.location.country || null,
          value.precision,
          hasLocation ? new Date() : null,
          value.linkedinUrl,
          value.facebookUrl,
          value.portfolioUrl,
          value.contributionCount,
          value.successRate,
          value.eligibility
        ]
      );
      const userId = inserted.rows[0].id;

      const fieldResolved = await syncUserField(client, userId, value.field);
      if (!fieldResolved) {
        await client.query("rollback");
        return reply.code(400).send({ message: "অজানা ক্ষেত্র নির্বাচন করা হয়েছে" });
      }

      await syncUserSkills(client, userId, value.skills);
      await syncUserInterests(client, userId, value.interests);

      await client.query("commit");

      const userRow = await findUserById(pool, userId);
      if (!userRow) throw new Error("newly created user not found");

      const token = await createSession(pool, userId);
      const user = await buildPublicUser(pool, userRow);

      return reply.code(201).send({ token, user });
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      if (isUniqueViolation(error)) {
        return reply.code(409).send({ message: "এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে" });
      }
      request.log.error(error);
      return reply.code(500).send({ message: "রেজিস্ট্রেশন সম্পন্ন করা যায়নি" });
    } finally {
      client.release();
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const { errors, email, password } = validateCredentials(request.body);
    if (errors.length) {
      return reply.code(400).send({ message: errors[0], errors });
    }

    const row = await findUserByEmail(pool, email);
    if (!row || !verifyPassword(password, row.password_hash)) {
      return reply.code(401).send({ message: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়" });
    }

    const token = await createSession(pool, row.id);
    const user = await buildPublicUser(pool, row);

    return reply.code(200).send({ token, user });
  });

  app.post("/auth/logout", async (request, reply) => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
    if (token) await revokeSession(pool, token);
    return reply.send({ ok: true });
  });

  app.get("/profile", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const row = await findUserById(pool, userId);
    if (!row) return reply.code(401).send({ message: "সেশন মেয়াদোত্তীর্ণ বা বাতিল হয়েছে, আবার লগইন করুন" });

    return reply.send(await buildPublicUser(pool, row));
  });

  app.get("/users/:id", async (request, reply) => {
    const viewerId = await requireUserId(request, reply, pool);
    if (!viewerId) return;

    const { id } = request.params as { id: string };
    const result = await pool.query<UserRow & { location_precision: string }>(
      `select ${userColumns}, location_precision from users where id = $1`,
      [id]
    );
    const row = result.rows[0];
    if (!row) return reply.code(404).send({ message: "ব্যবহারকারী পাওয়া যায়নি" });

    const user = await buildPublicUser(pool, row);

    return reply.send({
      ...user,
      location: {
        city: row.location_precision === "region" ? null : user.location.city,
        region: user.location.region,
        country: user.location.country
      }
    });
  });

  app.patch("/profile", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { errors, value } = validateProfileInput(request.body);
    if (errors.length || !value) {
      return reply.code(400).send({ message: errors[0], errors });
    }

    const hasLocation = Boolean(value.location.city || value.location.region || value.location.country);
    const client = await pool.connect();

    try {
      await client.query("begin");

      const updated = await client.query<UserRow>(
        `update users set
           public_name = $1, public_bio = $2, is_founder = $3, is_seeker = $4, availability = $5,
           location_city = $6, location_region = $7, location_country = $8, location_precision = $9,
           location_consent_at = $10,
           linkedin_url = $11, facebook_url = $12, portfolio_url = $13,
           contribution_count = $14, success_rate = $15, eligibility = $16,
           updated_at = now()
         where id = $17
         returning ${userColumns}`,
        [
          value.publicName,
          value.publicBio,
          value.isFounder,
          value.isSeeker,
          value.availability,
          value.location.city || null,
          value.location.region || null,
          value.location.country || null,
          value.precision,
          hasLocation ? new Date() : null,
          value.linkedinUrl,
          value.facebookUrl,
          value.portfolioUrl,
          value.contributionCount,
          value.successRate,
          value.eligibility,
          userId
        ]
      );

      if (!updated.rowCount) {
        await client.query("rollback");
        return reply.code(401).send({ message: "সেশন মেয়াদোত্তীর্ণ বা বাতিল হয়েছে, আবার লগইন করুন" });
      }

      const fieldResolved = await syncUserField(client, userId, value.field);
      if (!fieldResolved) {
        await client.query("rollback");
        return reply.code(400).send({ message: "অজানা ক্ষেত্র নির্বাচন করা হয়েছে" });
      }

      await syncUserSkills(client, userId, value.skills);
      await syncUserInterests(client, userId, value.interests);

      await client.query("commit");

      const user = await buildPublicUser(pool, updated.rows[0]);
      return reply.send(user);
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      request.log.error(error);
      return reply.code(500).send({ message: "প্রোফাইল আপডেট করা যায়নি" });
    } finally {
      client.release();
    }
  });
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}
