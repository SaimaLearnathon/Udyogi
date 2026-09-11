import { apiRequest } from "./client";
import type { PublicCandidate, PublicCandidateDetail, PublicListingDetail, PublicListingSummary, SentRequest } from "../types/listing";

export function listPublicListings(token: string) {
  return apiRequest<PublicListingSummary[]>("/api/listings", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getPublicListing(token: string, listingId: string) {
  return apiRequest<PublicListingDetail>(`/api/listings/${listingId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function findCandidatesForSkill(token: string, listingId: string, skill: string) {
  return apiRequest<PublicCandidate[]>(`/api/listings/${listingId}/candidates?skill=${encodeURIComponent(skill)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function getCandidateProfile(token: string, listingId: string, candidateId: string) {
  return apiRequest<PublicCandidateDetail>(`/api/listings/${listingId}/candidates/${candidateId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function listSentRequests(token: string, listingId: string) {
  return apiRequest<SentRequest[]>(`/api/listings/${listingId}/requests`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function sendTeamRequest(token: string, listingId: string, candidateId: string, skillTag?: string) {
  return apiRequest<{ id: string; status: string; createdAt: string }>(`/api/listings/${listingId}/requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ candidateId, skillTag })
  });
}
