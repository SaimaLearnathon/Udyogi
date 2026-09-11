import type { FastifyInstance } from "fastify";
import { pool } from "../../db/pool.js";
import { requireUserId } from "../auth/session.js";

interface ThesisRow {
  id: string;
  session_id: string;
  version: number;
  status: "draft" | "confirmed";
  parsed_data: Record<string, unknown>;
  confirmed_at: string | null;
  created_at: string;
}

export async function registerThesisRoutes(app: FastifyInstance) {
  app.get("/theses", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const result = await pool.query<ThesisRow & { mode: string }>(
      `select * from (
         select distinct on (t.session_id)
           t.id, t.session_id, t.version, t.status, t.parsed_data, t.confirmed_at, t.created_at, cs.mode
         from theses t
         join consultant_sessions cs on cs.id = t.session_id
         where t.user_id = $1
         order by t.session_id, t.version desc
       ) latest
       order by created_at desc`,
      [userId]
    );

    return reply.send(
      result.rows.map((row) => ({
        id: row.id,
        sessionId: row.session_id,
        mode: row.mode,
        version: row.version,
        status: row.status,
        parsedData: row.parsed_data,
        confirmedAt: row.confirmed_at,
        createdAt: row.created_at
      }))
    );
  });

  app.get("/theses/:id", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const result = await pool.query<ThesisRow>(
      "select id, session_id, version, status, parsed_data, confirmed_at, created_at from theses where id = $1 and user_id = $2",
      [id, userId]
    );
    const thesis = result.rows[0];
    if (!thesis) return reply.code(404).send({ message: "থিসিস পাওয়া যায়নি" });

    return reply.send({
      id: thesis.id,
      sessionId: thesis.session_id,
      version: thesis.version,
      status: thesis.status,
      parsedData: thesis.parsed_data,
      confirmedAt: thesis.confirmed_at,
      createdAt: thesis.created_at
    });
  });

  app.post("/theses/:id/confirm", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const result = await pool.query<ThesisRow>("select id, status from theses where id = $1 and user_id = $2", [id, userId]);
    const thesis = result.rows[0];
    if (!thesis) return reply.code(404).send({ message: "থিসিস পাওয়া যায়নি" });
    if (thesis.status === "confirmed") {
      return reply.code(409).send({ message: "থিসিস ইতিমধ্যে নিশ্চিত করা হয়েছে" });
    }

    const updated = await pool.query<ThesisRow>(
      "update theses set status = 'confirmed', confirmed_at = now() where id = $1 returning id, session_id, version, status, parsed_data, confirmed_at, created_at",
      [id]
    );

    const row = updated.rows[0];
    return reply.send({
      id: row.id,
      sessionId: row.session_id,
      version: row.version,
      status: row.status,
      parsedData: row.parsed_data,
      confirmedAt: row.confirmed_at,
      createdAt: row.created_at
    });
  });

  app.delete("/theses/:id", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    try {
      const result = await pool.query("delete from theses where id = $1 and user_id = $2 returning id", [id, userId]);
      if (!result.rowCount) return reply.code(404).send({ message: "থিসিস পাওয়া যায়নি" });
      return reply.code(204).send();
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return reply.code(409).send({ message: "এই থিসিসটি প্রকাশিত থাকায় মুছে ফেলা যাচ্ছে না" });
      }
      throw error;
    }
  });
}

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23503";
}
