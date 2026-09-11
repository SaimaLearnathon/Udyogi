import type { FastifyInstance } from "fastify";
import { ApiError, type Content, type GenerateContentParameters } from "@google/genai";
import { pool } from "../../db/pool.js";
import { env } from "../../config/env.js";
import { requireUserId } from "../auth/session.js";
import {
  PROPOSE_THESIS_FUNCTION,
  REQUEST_CONFIRMATION_FUNCTION,
  getGeminiClient,
  requestConfirmationFunctionDeclaration,
  systemInstructionFor,
  thesisFunctionDeclaration,
  type ConsultantMode
} from "./gemini.js";

const MODES: ConsultantMode[] = ["ideation", "validation"];

interface SessionRow {
  id: string;
  user_id: string;
  mode: ConsultantMode;
  status: string;
  created_at: string;
}

interface MessageRow {
  id: string;
  role: "user" | "assistant" | "system";
  content_ciphertext: string;
  created_at: string;
}

async function findSessionForUser(userId: string, sessionId: string) {
  const result = await pool.query<SessionRow>(
    "select id, user_id, mode, status, created_at from consultant_sessions where id = $1 and user_id = $2",
    [sessionId, userId]
  );
  return result.rows[0] ?? null;
}

async function loadMessages(sessionId: string) {
  const result = await pool.query<MessageRow>(
    "select id, role, content_ciphertext, created_at from consultant_messages where session_id = $1 order by created_at asc",
    [sessionId]
  );
  return result.rows;
}

function toGeminiContents(messages: MessageRow[]): Content[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content_ciphertext }]
    }));
}

async function logModelCall(
  userId: string,
  mode: ConsultantMode,
  status: "success" | "error",
  tokens?: { prompt?: number; completion?: number }
) {
  await pool.query(
    `insert into model_calls (user_id, purpose, model_version, status, prompt_tokens, completion_tokens)
     values ($1, $2, $3, $4, $5, $6)`,
    [userId, `consultant_${mode}`, env.GEMINI_MODEL, status, tokens?.prompt ?? null, tokens?.completion ?? null]
  );
}

const REQUIRED_THESIS_KEYS = [
  "idea_summary",
  "feasibility_assessment",
  "market_analysis",
  "licensing_notes",
  "mvp_roadmap",
  "financial_evaluation",
  "required_resources",
  "required_skillsets"
];

function isValidThesisPayload(data: unknown): data is Record<string, unknown> {
  if (typeof data !== "object" || data === null) return false;
  const record = data as Record<string, unknown>;
  return REQUIRED_THESIS_KEYS.every((key) => key in record);
}

const RETRYABLE_STATUS = new Set([429, 503]);

async function generateContentStreamWithRetry(
  client: ReturnType<typeof getGeminiClient>,
  params: GenerateContentParameters,
  attempts = 3
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await client.models.generateContentStream(params);
    } catch (error) {
      const retryable = error instanceof ApiError && RETRYABLE_STATUS.has(error.status);
      if (!retryable || attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** (attempt - 1)));
    }
  }
  throw new Error("unreachable");
}

function describeGeminiError(error: unknown): string {
  if (error instanceof ApiError && RETRYABLE_STATUS.has(error.status)) {
    return "AI সেবাটি এই মুহূর্তে ব্যস্ত, কিছুক্ষণ পর আবার চেষ্টা করুন";
  }
  return "AI থেকে উত্তর পাওয়া যায়নি, আবার চেষ্টা করুন";
}

export async function registerConsultantRoutes(app: FastifyInstance) {
  app.post("/consultant/sessions", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const body = request.body as { mode?: unknown };
    const mode = body.mode as ConsultantMode;
    if (!MODES.includes(mode)) {
      return reply.code(400).send({ message: "মোড 'ideation' অথবা 'validation' হতে হবে" });
    }

    const inserted = await pool.query<SessionRow>(
      "insert into consultant_sessions (user_id, mode) values ($1, $2) returning id, user_id, mode, status, created_at",
      [userId, mode]
    );

    const session = inserted.rows[0];
    return reply.code(201).send({
      id: session.id,
      mode: session.mode,
      status: session.status,
      createdAt: session.created_at
    });
  });

  app.get("/consultant/sessions", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const result = await pool.query<{
      id: string;
      mode: ConsultantMode;
      status: string;
      created_at: string;
      message_count: string;
      last_message: string | null;
      thesis_id: string | null;
      thesis_version: number | null;
      thesis_status: "draft" | "confirmed" | null;
    }>(
      `select
         cs.id, cs.mode, cs.status, cs.created_at,
         (select count(*) from consultant_messages cm where cm.session_id = cs.id) as message_count,
         (select cm.content_ciphertext from consultant_messages cm where cm.session_id = cs.id order by cm.created_at desc limit 1) as last_message,
         t.id as thesis_id, t.version as thesis_version, t.status as thesis_status
       from consultant_sessions cs
       left join lateral (
         select id, version, status from theses th where th.session_id = cs.id order by th.version desc limit 1
       ) t on true
       where cs.user_id = $1
       order by cs.created_at desc`,
      [userId]
    );

    return reply.send(
      result.rows.map((row) => ({
        id: row.id,
        mode: row.mode,
        status: row.status,
        createdAt: row.created_at,
        messageCount: Number(row.message_count),
        lastMessage: row.last_message,
        thesis: row.thesis_id ? { id: row.thesis_id, version: row.thesis_version, status: row.thesis_status } : null
      }))
    );
  });

  app.get("/consultant/sessions/:id", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const session = await findSessionForUser(userId, id);
    if (!session) return reply.code(404).send({ message: "সেশন পাওয়া যায়নি" });

    const messages = await loadMessages(session.id);
    const theses = await pool.query(
      "select id, version, status, parsed_data, confirmed_at, created_at from theses where session_id = $1 order by version desc",
      [session.id]
    );

    return reply.send({
      id: session.id,
      mode: session.mode,
      status: session.status,
      createdAt: session.created_at,
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content_ciphertext,
        createdAt: message.created_at
      })),
      theses: theses.rows.map((row) => ({
        id: row.id,
        version: row.version,
        status: row.status,
        parsedData: row.parsed_data,
        confirmedAt: row.confirmed_at,
        createdAt: row.created_at
      }))
    });
  });

  app.delete("/consultant/sessions/:id", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const result = await pool.query("delete from consultant_sessions where id = $1 and user_id = $2 returning id", [id, userId]);
    if (!result.rowCount) return reply.code(404).send({ message: "সেশন পাওয়া যায়নি" });

    return reply.code(204).send();
  });

  app.post("/consultant/sessions/:id/messages", async (request, reply) => {
    const userId = await requireUserId(request, reply, pool);
    if (!userId) return;

    const { id } = request.params as { id: string };
    const session = await findSessionForUser(userId, id);
    if (!session) return reply.code(404).send({ message: "সেশন পাওয়া যায়নি" });

    const body = request.body as { content?: unknown };
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) return reply.code(400).send({ message: "বার্তা খালি রাখা যাবে না" });

    let client;
    try {
      client = getGeminiClient();
    } catch {
      return reply.code(503).send({ message: "AI কনসালট্যান্ট সেবাটি এখনো কনফিগার করা হয়নি" });
    }

    await pool.query("insert into consultant_messages (session_id, role, content_ciphertext) values ($1, 'user', $2)", [
      session.id,
      content
    ]);

    const history = toGeminiContents(await loadMessages(session.id));

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });

    const send = (event: Record<string, unknown>) => {
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const config = {
      systemInstruction: systemInstructionFor(session.mode),
      tools: [{ functionDeclarations: [thesisFunctionDeclaration, requestConfirmationFunctionDeclaration] }]
    };

    try {
      let assistantText = "";
      let capturedCall: { id?: string; name: string; args: Record<string, unknown> } | null = null;
      let usage: { promptTokenCount?: number; candidatesTokenCount?: number } = {};

      const stream = await generateContentStreamWithRetry(client, { model: env.GEMINI_MODEL, contents: history, config });

      for await (const chunk of stream) {
        if (chunk.text) {
          assistantText += chunk.text;
          send({ type: "text", value: chunk.text });
        }
        const calls = chunk.functionCalls;
        if (calls?.length && calls[0].name) {
          capturedCall = { id: calls[0].id, name: calls[0].name, args: calls[0].args ?? {} };
        }
        if (chunk.usageMetadata) usage = chunk.usageMetadata;
      }

      if (capturedCall && capturedCall.name === REQUEST_CONFIRMATION_FUNCTION) {
        send({ type: "confirmation", value: {} });
      }

      if (capturedCall && capturedCall.name === PROPOSE_THESIS_FUNCTION && isValidThesisPayload(capturedCall.args)) {
        const versionResult = await pool.query<{ next: number }>(
          "select coalesce(max(version), 0) + 1 as next from theses where session_id = $1",
          [session.id]
        );
        const version = versionResult.rows[0].next;

        const inserted = await pool.query<{ id: string }>(
          `insert into theses (session_id, user_id, version, status, parsed_data, raw_model_output)
           values ($1, $2, $3, 'draft', $4, $5)
           returning id`,
          [session.id, userId, version, JSON.stringify(capturedCall.args), JSON.stringify(capturedCall.args)]
        );

        const thesisId = inserted.rows[0].id;
        send({ type: "thesis", value: { id: thesisId, version, status: "draft", parsedData: capturedCall.args } });

        const followUpContents: Content[] = [
          ...history,
          { role: "model", parts: [{ functionCall: { id: capturedCall.id, name: capturedCall.name, args: capturedCall.args } }] },
          {
            role: "user",
            parts: [
              {
                functionResponse: {
                  id: capturedCall.id,
                  name: capturedCall.name,
                  response: { status: "saved", thesis_id: thesisId, version }
                }
              }
            ]
          }
        ];

        const followUpStream = await generateContentStreamWithRetry(client, {
          model: env.GEMINI_MODEL,
          contents: followUpContents,
          config
        });

        for await (const chunk of followUpStream) {
          if (chunk.text) {
            assistantText += chunk.text;
            send({ type: "text", value: chunk.text });
          }
          if (chunk.usageMetadata) usage = chunk.usageMetadata;
        }
      }

      if (assistantText.trim()) {
        await pool.query("insert into consultant_messages (session_id, role, content_ciphertext) values ($1, 'assistant', $2)", [
          session.id,
          assistantText.trim()
        ]);
      }

      await logModelCall(userId, session.mode, "success", {
        prompt: usage.promptTokenCount,
        completion: usage.candidatesTokenCount
      });

      send({ type: "done" });
    } catch (error) {
      request.log.error(error);
      await logModelCall(userId, session.mode, "error").catch(() => undefined);
      send({ type: "error", message: describeGeminiError(error) });
    } finally {
      reply.raw.end();
    }
  });
}
