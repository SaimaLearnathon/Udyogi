import { apiRequest } from "./client";
import type { ProfilePayload, PublicUser } from "../types/profile";

export function getProfile(token: string) {
  return apiRequest<PublicUser>("/api/profile", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function updateProfile(token: string, payload: ProfilePayload) {
  return apiRequest<PublicUser>("/api/profile", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function getPublicProfile(token: string, userId: string) {
  return apiRequest<PublicUser>(`/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}
