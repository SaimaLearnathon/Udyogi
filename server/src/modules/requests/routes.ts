import type { FastifyInstance } from "fastify";
import { pool } from "../../db/pool.js";
import { requireUserId } from "../auth/session.js";

interface IncomingRequestRow {
  id: string;
  status: "pending" | "accepted" | "declined";
  skill_tag: string | null;
  message: string | null;
  created_at: string;
  founder_id: string;
  founder_name: string;
  founder_bio: string;
  idea_title: string;
  idea_pitch: string;
}

export async function registerRequestRoutes(app: FastifyInstance) {
  app.get("/requests/incoming", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const result = await pool.query<IncomingRequestRow>(
      `select
         tr.id, tr.status, tr.skill_tag, tr.message, tr.created_at,
         u.id as founder_id, u.public_name as founder_name, u.public_bio as founder_bio,
         t.parsed_data->'idea_summary'->>'solution' as idea_title,
         t.parsed_data->'idea_summary'->>'value_proposition' as idea_pitch
       from team_requests tr
       join users u on u.id = tr.founder_id
       join theses t on t.id = tr.thesis_id
       where tr.candidate_id = $1
       order by tr.created_at desc`,
      [userId]
    );

    return reply.send(
      result.rows.map((row) => ({
        id: row.id,
        status: row.status,
        skillTag: row.skill_tag,
        message: row.message,
        createdAt: row.created_at,
        founder: { id: row.founder_id, publicName: row.founder_name, publicBio: row.founder_bio },
        idea: { title: row.idea_title, pitch: row.idea_pitch }
      }))
    );
  });

  app.post("/requests/:id/respond", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const body = request.body as { status?: unknown };
    const status = body.status;
    if (status !== "accepted" && status !== "declined") {
      return reply.code(400).send({ message: "সিদ্ধান্ত 'accepted' অথবা 'declined' হতে হবে" });
    }

    const existing = await pool.query<{ status: string }>(
      "select status from team_requests where id = $1 and candidate_id = $2",
      [id, userId]
    );
    if (!existing.rowCount) return reply.code(404).send({ message: "অনুরোধ পাওয়া যায়নি" });
    if (existing.rows[0].status !== "pending") {
      return reply.code(409).send({ message: "এই অনুরোধের সিদ্ধান্ত ইতিমধ্যে দেওয়া হয়েছে" });
    }

    const updated = await pool.query<{ id: string; status: string }>(
      "update team_requests set status = $1, responded_at = now(), updated_at = now() where id = $2 returning id, status",
      [status, id]
    );

    return reply.send(updated.rows[0]);
  });
}
