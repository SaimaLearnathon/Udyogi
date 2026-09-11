import { apiRequest } from "./client";
import type { IncomingRequest } from "../types/request";

export function listIncomingRequests(token: string) {
  return apiRequest<IncomingRequest[]>("/api/requests/incoming", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function respondToRequest(token: string, requestId: string, status: "accepted" | "declined") {
  return apiRequest<{ id: string; status: string }>(`/api/requests/${requestId}/respond`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
}
