import { apiRequest } from "./client";
import type { ThesisSummary } from "../types/thesis";

export function listTheses(token: string) {
  return apiRequest<ThesisSummary[]>("/api/theses", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getThesis(token: string, thesisId: string) {
  return apiRequest<ThesisSummary>(`/api/theses/${thesisId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function confirmThesis(token: string, thesisId: string) {
  return apiRequest<ThesisSummary>(`/api/theses/${thesisId}/confirm`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}
