import { apiRequest } from "./client";
import type { ProfilePayload, PublicUser } from "../types/profile";

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export function register(payload: ProfilePayload) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function logout(token: string) {
  return apiRequest<{ ok: true }>("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
}
