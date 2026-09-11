import type { Availability, PublicSocials } from "./profile";

export interface ListingSkill {
  skillTag: string;
  priority: "High" | "Medium" | "Low";
}

export interface PublicListingSummary {
  id: string;
  title: string;
  pitch: string;
  founderName: string;
  requiredSkillsets: ListingSkill[];
  confirmedAt: string;
}

export interface PublicListingDetail extends PublicListingSummary {
  founderBio: string;
  ideaSummary: {
    problem: string;
    solution: string;
    target_customer: string;
    value_proposition: string;
  };
  feasibilityRating: "Low" | "Medium" | "High";
  requiredSkillsets: (ListingSkill & { description: string })[];
}

export interface ScoreBreakdown {
  skill: number;
  location: number;
  availability: number;
}

export interface PublicCandidate {
  id: string;
  publicName: string;
  publicBio: string;
  availability: Availability;
  field: string | null;
  skills: string[];
  location: { city: string | null; region: string | null; country: string | null };
  socials: PublicSocials;
  contributionCount: number;
  successRate: number | null;
  eligibility: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  matchedSkills: string[];
}

export interface PublicCandidateDetail extends PublicCandidate {
  requestStatus: "pending" | "accepted" | "declined" | null;
}

export interface SentRequest {
  candidateId: string;
  status: "pending" | "accepted" | "declined";
  skillTag: string | null;
  createdAt: string;
}
