import type { FastifyInstance } from "fastify";
import { pool } from "../../db/pool.js";
import { normalizeBengaliText } from "../../utils/text.js";
import { requireUserId } from "../auth/session.js";
import { loadCurrentProjects } from "../requests/routes.js";

interface RequiredSkill {
  skill_tag: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

interface ThesisParsedData {
  idea_summary: { problem: string; solution: string; target_customer: string; value_proposition: string };
  feasibility_assessment: { rating: string; rationale: string };
  required_skillsets: RequiredSkill[];
}

interface ListingRow {
  id: string;
  user_id: string;
  parsed_data: ThesisParsedData;
  confirmed_at: string;
  public_name: string;
}

function summarize(row: ListingRow) {
  const idea = row.parsed_data.idea_summary;
  return {
    id: row.id,
    title: idea.solution,
    pitch: idea.value_proposition,
    founderName: row.public_name,
    requiredSkillsets: row.parsed_data.required_skillsets.map((skill) => ({
      skillTag: skill.skill_tag,
      priority: skill.priority
    })),
    confirmedAt: row.confirmed_at
  };
}

function fuzzyMatch(a: string, b: string): boolean {
  const x = normalizeBengaliText(a).toLowerCase();
  const y = normalizeBengaliText(b).toLowerCase();
  return x.includes(y) || y.includes(x);
}

interface CandidateRow {
  id: string;
  public_name: string;
  public_bio: string;
  availability: string;
  field_label: string | null;
  location_city: string | null;
  location_region: string | null;
  location_country: string | null;
  location_precision: string;
  linkedin_url: string | null;
  facebook_url: string | null;
  portfolio_url: string | null;
  contribution_count: number;
  success_rate: number | null;
  eligibility: string;
  skills: string[];
}

async function loadCandidateRows(candidateIds: string[]): Promise<CandidateRow[]> {
  if (candidateIds.length === 0) return [];

  const usersResult = await pool.query<{
    id: string;
    public_name: string;
    public_bio: string;
    availability: string;
    location_city: string | null;
    location_region: string | null;
    location_country: string | null;
    location_precision: string;
    linkedin_url: string | null;
    facebook_url: string | null;
    portfolio_url: string | null;
    contribution_count: number;
    success_rate: number | null;
    eligibility: string;
  }>(
    `select id, public_name, public_bio, availability, location_city, location_region, location_country, location_precision,
            linkedin_url, facebook_url, portfolio_url, contribution_count, success_rate, eligibility
     from users where id = any($1::uuid[])`,
    [candidateIds]
  );

  const rows = await Promise.all(
    usersResult.rows.map(async (row) => {
      const [skillsResult, fieldResult] = await Promise.all([
        pool.query<{ label: string }>(
          `select st.label_bn as label from user_skills us join skill_taxonomy st on st.id = us.skill_id where us.user_id = $1
           union
           select label from user_custom_skills where user_id = $1`,
          [row.id]
        ),
        pool.query<{ label_bn: string }>(
          "select ft.label_bn from user_fields uf join field_taxonomy ft on ft.id = uf.field_id where uf.user_id = $1 limit 1",
          [row.id]
        )
      ]);

      return {
        ...row,
        field_label: fieldResult.rows[0]?.label_bn ?? null,
        skills: skillsResult.rows.map((s) => s.label)
      };
    })
  );

  return rows;
}

function scoreCandidate(
  candidate: CandidateRow,
  requiredSkills: RequiredSkill[],
  founderLocation: { city: string | null; region: string | null }
) {
  const matchedSkills = requiredSkills.filter((req) => candidate.skills.some((skill) => fuzzyMatch(skill, req.skill_tag)));
  const skillScore = requiredSkills.length ? Math.round((matchedSkills.length / requiredSkills.length) * 50) : 0;

  let locationScore = 6;
  if (founderLocation.city && candidate.location_city && founderLocation.city.toLowerCase() === candidate.location_city.toLowerCase()) {
    locationScore = 30;
  } else if (
    founderLocation.region &&
    candidate.location_region &&
    founderLocation.region.toLowerCase() === candidate.location_region.toLowerCase()
  ) {
    locationScore = 18;
  }

  const availabilityScore = candidate.availability === "full_time" ? 20 : candidate.availability === "part_time" ? 12 : 8;

  const total = Math.min(100, skillScore + locationScore + availabilityScore);

  return {
    total,
    breakdown: { skill: skillScore, location: locationScore, availability: availabilityScore },
    matchedSkills: matchedSkills.map((s) => s.skill_tag)
  };
}

function toPublicCandidate(row: CandidateRow) {
  return {
    id: row.id,
    publicName: row.public_name,
    publicBio: row.public_bio,
    availability: row.availability,
    field: row.field_label,
    skills: row.skills,
    location: {
      city: row.location_precision === "region" ? null : row.location_city,
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

async function findOwnedListing(id: string, userId: string) {
  const result = await pool.query<ListingRow>(
    `select t.id, t.user_id, t.parsed_data, t.confirmed_at, u.public_name
     from theses t
     join users u on u.id = t.user_id
     where t.id = $1 and t.status = 'confirmed' and t.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function registerListingRoutes(app: FastifyInstance) {
  app.get("/listings", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const result = await pool.query<ListingRow>(
      `select t.id, t.user_id, t.parsed_data, t.confirmed_at, u.public_name
       from theses t
       join users u on u.id = t.user_id
       where t.status = 'confirmed' and t.user_id = $1
       order by t.confirmed_at desc`,
      [userId]
    );

    return reply.send(result.rows.map(summarize));
  });

  app.get("/listings/:id", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const result = await pool.query<ListingRow & { public_bio: string }>(
      `select t.id, t.user_id, t.parsed_data, t.confirmed_at, u.public_name, u.public_bio
       from theses t
       join users u on u.id = t.user_id
       where t.id = $1 and t.status = 'confirmed' and t.user_id = $2`,
      [id, userId]
    );
    const row = result.rows[0];
    if (!row) return reply.code(404).send({ message: "লিস্টিং পাওয়া যায়নি" });

    return reply.send({
      ...summarize(row),
      founderBio: row.public_bio,
      ideaSummary: row.parsed_data.idea_summary,
      feasibilityRating: row.parsed_data.feasibility_assessment.rating,
      requiredSkillsets: row.parsed_data.required_skillsets.map((skill) => ({
        skillTag: skill.skill_tag,
        description: skill.description,
        priority: skill.priority
      }))
    });
  });

  app.get("/listings/:id/candidates", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const query = request.query as { skill?: string };
    const skill = normalizeBengaliText(query.skill ?? "");
    if (!skill) return reply.code(400).send({ message: "দক্ষতা নির্বাচন করুন" });

    const listing = await findOwnedListing(id, userId);
    if (!listing) return reply.code(404).send({ message: "লিস্টিং পাওয়া যায়নি" });

    const founder = await pool.query<{ location_city: string | null; location_region: string | null }>(
      "select location_city, location_region from users where id = $1",
      [userId]
    );
    const founderLocation = founder.rows[0] ?? { location_city: null, location_region: null };

    const matches = await pool.query<{ id: string }>(
      `select distinct u.id
       from users u
       where u.is_seeker = true and u.id != $2
         and (
           exists (
             select 1 from user_skills us join skill_taxonomy st on st.id = us.skill_id
             where us.user_id = u.id and (st.label_bn ilike '%' || $1 || '%' or $1 ilike '%' || st.label_bn || '%')
           )
           or exists (
             select 1 from user_custom_skills ucs
             where ucs.user_id = u.id and (ucs.label ilike '%' || $1 || '%' or $1 ilike '%' || ucs.label || '%')
           )
         )`,
      [skill, userId]
    );

    const candidateRows = await loadCandidateRows(matches.rows.map((row) => row.id));
    const requiredSkills = listing.parsed_data.required_skillsets;

    const candidates = candidateRows
      .map((row) => {
        const score = scoreCandidate(row, requiredSkills, { city: founderLocation.location_city, region: founderLocation.location_region });
        return { ...toPublicCandidate(row), score: score.total, scoreBreakdown: score.breakdown, matchedSkills: score.matchedSkills };
      })
      .sort((a, b) => b.score - a.score);

    return reply.send(candidates);
  });

  app.get("/listings/:id/candidates/:candidateId", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id, candidateId } = request.params as { id: string; candidateId: string };
    const listing = await findOwnedListing(id, userId);
    if (!listing) return reply.code(404).send({ message: "লিস্টিং পাওয়া যায়নি" });

    const founder = await pool.query<{ location_city: string | null; location_region: string | null }>(
      "select location_city, location_region from users where id = $1",
      [userId]
    );
    const founderLocation = founder.rows[0] ?? { location_city: null, location_region: null };

    const [candidateRow] = await loadCandidateRows([candidateId]);
    if (!candidateRow) return reply.code(404).send({ message: "প্রোফাইল পাওয়া যায়নি" });

    const score = scoreCandidate(candidateRow, listing.parsed_data.required_skillsets, {
      city: founderLocation.location_city,
      region: founderLocation.location_region
    });

    const [requestRow, currentProjects] = await Promise.all([
      pool.query<{ status: string }>("select status from team_requests where thesis_id = $1 and candidate_id = $2", [id, candidateId]),
      loadCurrentProjects(candidateId)
    ]);

    return reply.send({
      ...toPublicCandidate(candidateRow),
      score: score.total,
      scoreBreakdown: score.breakdown,
      matchedSkills: score.matchedSkills,
      requestStatus: requestRow.rows[0]?.status ?? null,
      currentProjects
    });
  });

  app.get("/listings/:id/requests", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const listing = await findOwnedListing(id, userId);
    if (!listing) return reply.code(404).send({ message: "লিস্টিং পাওয়া যায়নি" });

    const result = await pool.query<{ candidate_id: string; status: string; skill_tag: string | null; created_at: string }>(
      "select candidate_id, status, skill_tag, created_at from team_requests where thesis_id = $1 order by created_at desc",
      [id]
    );

    return reply.send(
      result.rows.map((row) => ({
        candidateId: row.candidate_id,
        status: row.status,
        skillTag: row.skill_tag,
        createdAt: row.created_at
      }))
    );
  });

  app.get("/listings/:id/team", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const listing = await findOwnedListing(id, userId);
    if (!listing) return reply.code(404).send({ message: "লিস্টিং পাওয়া যায়নি" });

    const result = await pool.query<{
      candidate_id: string;
      public_name: string;
      public_bio: string;
      availability: string;
      skill_tag: string | null;
      responded_at: string | null;
      field_label: string | null;
    }>(
      `select tr.candidate_id, u.public_name, u.public_bio, u.availability, tr.skill_tag, tr.responded_at,
              ft.label_bn as field_label
       from team_requests tr
       join users u on u.id = tr.candidate_id
       left join user_fields uf on uf.user_id = u.id
       left join field_taxonomy ft on ft.id = uf.field_id
       where tr.thesis_id = $1 and tr.status = 'accepted'
       order by tr.responded_at desc`,
      [id]
    );

    return reply.send(
      result.rows.map((row) => ({
        candidateId: row.candidate_id,
        publicName: row.public_name,
        publicBio: row.public_bio,
        availability: row.availability,
        field: row.field_label,
        skillTag: row.skill_tag,
        joinedAt: row.responded_at
      }))
    );
  });

  app.post("/listings/:id/requests", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const body = request.body as { candidateId?: unknown; skillTag?: unknown; message?: unknown };
    const candidateId = typeof body.candidateId === "string" ? body.candidateId : "";
    if (!candidateId) return reply.code(400).send({ message: "টিমমেট নির্বাচন করুন" });

    const listing = await findOwnedListing(id, userId);
    if (!listing) return reply.code(404).send({ message: "লিস্টিং পাওয়া যায়নি" });

    const candidate = await pool.query("select id from users where id = $1 and is_seeker = true", [candidateId]);
    if (!candidate.rowCount) return reply.code(404).send({ message: "প্রোফাইল পাওয়া যায়নি" });

    try {
      const inserted = await pool.query<{ id: string; status: string; created_at: string }>(
        `insert into team_requests (thesis_id, founder_id, candidate_id, skill_tag, message)
         values ($1, $2, $3, $4, $5)
         returning id, status, created_at`,
        [
          id,
          userId,
          candidateId,
          typeof body.skillTag === "string" ? body.skillTag : null,
          typeof body.message === "string" ? body.message.trim() || null : null
        ]
      );
      const row = inserted.rows[0];
      return reply.code(201).send({ id: row.id, status: row.status, createdAt: row.created_at });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return reply.code(409).send({ message: "এই ব্যবহারকারীকে ইতিমধ্যে অনুরোধ পাঠানো হয়েছে" });
      }
      throw error;
    }
  });
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505";
}
