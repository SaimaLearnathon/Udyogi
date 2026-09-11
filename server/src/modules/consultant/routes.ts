import type { FastifyInstance } from "fastify";
import { ApiError, ThinkingLevel, type Content, type GenerateContentParameters } from "@google/genai";
import { pool } from "../../db/pool.js";
import { env } from "../../config/env.js";
import { normalizeDeep } from "../../utils/text.js";
import { requireUserId } from "../auth/session.js";
import {
  CONFIRM_THESIS_FUNCTION,
  PROPOSE_THESIS_FUNCTION,
  REQUEST_CONFIRMATION_FUNCTION,
  STATUS_LINE_PREFIX,
  confirmThesisFunctionDeclaration,
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

interface GeminiErrorDetails {
  status?: string;
  quotaId?: string;
  retryDelaySeconds?: number;
}

function parseGeminiErrorDetails(error: ApiError): GeminiErrorDetails {
  try {
    const parsed = JSON.parse(error.message) as {
      error?: { status?: string; details?: Array<Record<string, unknown>> };
    };
    const details = parsed.error?.details ?? [];
    const quotaFailure = details.find((d) => typeof d["@type"] === "string" && (d["@type"] as string).includes("QuotaFailure"));
    const retryInfo = details.find((d) => typeof d["@type"] === "string" && (d["@type"] as string).includes("RetryInfo"));
    const quotaId = (quotaFailure?.violations as Array<{ quotaId?: string }> | undefined)?.[0]?.quotaId;
    const retryDelayRaw = retryInfo?.retryDelay as string | undefined;
    const retryDelaySeconds = retryDelayRaw ? Number.parseFloat(retryDelayRaw) : undefined;
    return { status: parsed.error?.status, quotaId, retryDelaySeconds };
  } catch {
    return {};
  }
}

const MAX_INLINE_RETRY_DELAY_SECONDS = 5;

async function generateContentStreamWithRetry(
  client: ReturnType<typeof getGeminiClient>,
  params: GenerateContentParameters,
  attempts = 3
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await client.models.generateContentStream(params);
    } catch (error) {
      if (!(error instanceof ApiError) || attempt === attempts) throw error;

      if (error.status === 503) {
        await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** (attempt - 1)));
        continue;
      }

      if (error.status === 429) {
        const details = parseGeminiErrorDetails(error);
        const isDailyQuota = details.quotaId?.toLowerCase().includes("perday");
        if (isDailyQuota) throw error; // won't recover within this request, no point retrying

        const delaySeconds = details.retryDelaySeconds;
        if (delaySeconds !== undefined && delaySeconds <= MAX_INLINE_RETRY_DELAY_SECONDS) {
          await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
          continue;
        }
        throw error; // suggested wait too long to hold the connection open for
      }

      throw error;
    }
  }
  throw new Error("unreachable");
}

interface CapturedCall {
  id?: string;
  name: string;
  args: Record<string, unknown>;
  thoughtSignature?: string;
}

interface StreamState {
  assistantText: string;
  buffer: string;
  capturedCall: CapturedCall | null;
  usage: { promptTokenCount?: number; candidatesTokenCount?: number };
}

function emitStreamLine(line: string, send: (event: Record<string, unknown>) => void, state: StreamState) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith(STATUS_LINE_PREFIX)) {
    const statusText = trimmed.slice(STATUS_LINE_PREFIX.length).trim();
    if (statusText) send({ type: "status", value: statusText });
    return;
  }
  state.assistantText += line;
  send({ type: "text", value: line });
}

function flushStreamBuffer(send: (event: Record<string, unknown>) => void, state: StreamState) {
  if (state.buffer) {
    emitStreamLine(state.buffer, send, state);
    state.buffer = "";
  }
}

async function pumpStream(
  stream: AsyncIterable<{
    text?: string;
    candidates?: Array<{ content?: { parts?: Array<{ functionCall?: { id?: string; name?: string; args?: Record<string, unknown> }; thoughtSignature?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  }>,
  send: (event: Record<string, unknown>) => void,
  state: StreamState
) {
  for await (const chunk of stream) {
    if (chunk.text) {
      state.buffer += chunk.text;
      let newlineIndex: number;
      while ((newlineIndex = state.buffer.indexOf("\n")) !== -1) {
        const line = state.buffer.slice(0, newlineIndex + 1);
        state.buffer = state.buffer.slice(newlineIndex + 1);
        emitStreamLine(line, send, state);
      }
    }
    for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
      if (part.functionCall?.name) {
        state.capturedCall = {
          id: part.functionCall.id,
          name: part.functionCall.name,
          args: part.functionCall.args ?? {},
          thoughtSignature: part.thoughtSignature
        };
      }
    }
    if (chunk.usageMetadata) state.usage = chunk.usageMetadata;
  }
}

function describeGeminiError(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    const details = parseGeminiErrorDetails(error);
    if (details.quotaId?.toLowerCase().includes("perday")) {
      return "AI সেবার আজকের ব্যবহারের সীমা (কোটা) শেষ হয়ে গেছে। কিছুক্ষণ পর অথবা পরের দিন আবার চেষ্টা করুন, অথবা আপনার Gemini API অ্যাকাউন্টে বিলিং চালু করে সীমা বাড়ান।";
    }
    const wait = details.retryDelaySeconds ? Math.ceil(details.retryDelaySeconds) : null;
    return wait
      ? `AI সেবাটি এই মুহূর্তে ব্যস্ত, প্রায় ${wait} সেকেন্ড পর আবার চেষ্টা করুন।`
      : "AI সেবাটি এই মুহূর্তে ব্যস্ত, কিছুক্ষণ পর আবার চেষ্টা করুন";
  }
  if (error instanceof ApiError && error.status === 503) {
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
      tools: [
        { functionDeclarations: [thesisFunctionDeclaration, requestConfirmationFunctionDeclaration, confirmThesisFunctionDeclaration] }
      ],
      // low thinking keeps replies fast; the schema is explicit enough that heavy reasoning isn't needed
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    };

    try {
      const state: StreamState = { assistantText: "", buffer: "", capturedCall: null, usage: {} };

      const stream = await generateContentStreamWithRetry(client, { model: env.GEMINI_MODEL, contents: history, config });
      await pumpStream(stream, send, state);
      flushStreamBuffer(send, state);

      const capturedCall = state.capturedCall;
      let assistantText = state.assistantText;
      const usage = state.usage;

      if (capturedCall && capturedCall.name === REQUEST_CONFIRMATION_FUNCTION) {
        send({ type: "confirmation", value: {} });
      }

      if (!capturedCall && assistantText.trim()) {
        // The model sometimes writes the step-1 summary but skips the request_confirmation
        // tool call it's supposed to make right after. Once enough of step 1 has happened,
        // fall back to showing the button ourselves so the user is never stuck without a
        // way to proceed to the full analysis.
        const userTurns = history.filter((entry) => entry.role === "user").length;
        if (userTurns >= 3) {
          const existingThesis = await pool.query("select 1 from theses where session_id = $1 limit 1", [session.id]);
          if (existingThesis.rowCount === 0) {
            send({ type: "confirmation", value: {} });
          }
        }
      }

      if (capturedCall && capturedCall.name === PROPOSE_THESIS_FUNCTION && isValidThesisPayload(capturedCall.args)) {
        const versionResult = await pool.query<{ next: number }>(
          "select coalesce(max(version), 0) + 1 as next from theses where session_id = $1",
          [session.id]
        );
        const version = versionResult.rows[0].next;

        const normalizedArgs = normalizeDeep(capturedCall.args);

        const inserted = await pool.query<{ id: string }>(
          `insert into theses (session_id, user_id, version, status, parsed_data, raw_model_output)
           values ($1, $2, $3, 'draft', $4, $5)
           returning id`,
          [session.id, userId, version, JSON.stringify(normalizedArgs), JSON.stringify(capturedCall.args)]
        );

        const thesisId = inserted.rows[0].id;
        send({ type: "thesis", value: { id: thesisId, version, status: "draft", parsedData: normalizedArgs } });

        const ackText = "থিসিসের একটি বিস্তারিত খসড়া তৈরি হয়ে গেছে। পাশের প্যানেলে বা 'থিসিস দেখুন' বাটনে ক্লিক করে এটি পর্যালোচনা করতে পারবেন।";
        send({ type: "text", value: ackText });
        assistantText += (assistantText ? "\n" : "") + ackText;
      }

      if (capturedCall && capturedCall.name === CONFIRM_THESIS_FUNCTION) {
        const latestThesis = await pool.query<{ id: string; version: number; status: string; parsed_data: Record<string, unknown> }>(
          "select id, version, status, parsed_data from theses where session_id = $1 order by version desc limit 1",
          [session.id]
        );
        const latest = latestThesis.rows[0];

        let functionResponsePayload: Record<string, unknown>;
        if (!latest) {
          functionResponsePayload = { status: "no_draft_found" };
        } else if (latest.status === "confirmed") {
          functionResponsePayload = { status: "already_confirmed", thesis_id: latest.id, version: latest.version };
        } else {
          const confirmed = await pool.query<{ id: string; version: number }>(
            "update theses set status = 'confirmed', confirmed_at = now() where id = $1 returning id, version",
            [latest.id]
          );
          const row = confirmed.rows[0];
          send({ type: "thesis", value: { id: row.id, version: row.version, status: "confirmed", parsedData: latest.parsed_data } });
          functionResponsePayload = { status: "confirmed", thesis_id: row.id, version: row.version };
        }

        const ackText =
          functionResponsePayload.status === "confirmed"
            ? "থিসিসটি সফলভাবে নিশ্চিত করা হয়েছে।"
            : functionResponsePayload.status === "already_confirmed"
              ? "থিসিসটি ইতিমধ্যে নিশ্চিত করা আছে।"
              : "কোনো খসড়া থিসিস পাওয়া যায়নি। আগে বিস্তারিত বিশ্লেষণ করে একটি খসড়া তৈরি করুন।";
        send({ type: "text", value: ackText });
        assistantText += (assistantText ? "\n" : "") + ackText;
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
