import { apiRequest } from "./client";
import type { ThesisParsedData } from "../types/thesis";

export type ConsultantMode = "ideation" | "validation";

export interface ConsultantSession {
  id: string;
  mode: ConsultantMode;
  status: string;
  createdAt: string;
}

export interface ConsultantMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface ConsultantSessionDetail extends ConsultantSession {
  messages: ConsultantMessage[];
  theses: Array<{
    id: string;
    version: number;
    status: "draft" | "confirmed";
    parsedData: ThesisParsedData;
    confirmedAt: string | null;
    createdAt: string;
  }>;
}

export interface ConsultantSessionListItem {
  id: string;
  mode: ConsultantMode;
  status: string;
  createdAt: string;
  messageCount: number;
  lastMessage: string | null;
  thesis: { id: string; version: number; status: "draft" | "confirmed" } | null;
}

export function listConsultantSessions(token: string) {
  return apiRequest<ConsultantSessionListItem[]>("/api/consultant/sessions", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function deleteConsultantSession(token: string, sessionId: string) {
  return apiRequest<void>(`/api/consultant/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function createConsultantSession(token: string, mode: ConsultantMode) {
  return apiRequest<ConsultantSession>("/api/consultant/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mode })
  });
}

export function getConsultantSession(token: string, sessionId: string) {
  return apiRequest<ConsultantSessionDetail>(`/api/consultant/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export interface ConsultantStreamHandlers {
  onText?: (value: string) => void;
  onStatus?: (value: string) => void;
  onThesis?: (thesis: { id: string; version: number; status: "draft" | "confirmed"; parsedData: ThesisParsedData }) => void;
  onConfirmationRequest?: () => void;
  onError?: (message: string) => void;
  onDone?: () => void;
}

export async function sendConsultantMessage(token: string, sessionId: string, content: string, handlers: ConsultantStreamHandlers) {
  const response = await fetch(`/api/consultant/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content })
  });

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => null);
    handlers.onError?.(data?.message ?? "অনুরোধটি সম্পন্ন হয়নি");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");

      const line = rawEvent.split("\n").find((entry) => entry.startsWith("data: "));
      if (!line) continue;

      try {
        const payload = JSON.parse(line.slice("data: ".length));
        if (payload.type === "text") handlers.onText?.(payload.value);
        else if (payload.type === "status") handlers.onStatus?.(payload.value);
        else if (payload.type === "thesis") handlers.onThesis?.(payload.value);
        else if (payload.type === "confirmation") handlers.onConfirmationRequest?.();
        else if (payload.type === "error") handlers.onError?.(payload.message);
        else if (payload.type === "done") handlers.onDone?.();
      } catch {
        // ignore malformed event chunk
      }
    }
  }
}
