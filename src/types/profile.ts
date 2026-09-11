export type Availability = "full_time" | "part_time" | "advisor";
export type LocationPrecision = "exact" | "city" | "region";

export interface PublicLocation {
  city: string | null;
  region: string | null;
  country: string | null;
}

export interface PublicSocials {
  linkedinUrl: string | null;
  facebookUrl: string | null;
  portfolioUrl: string | null;
}

export interface PublicCurrentProject {
  thesisId: string;
  title: string;
  pitch: string;
  founderName: string;
  skillTag: string | null;
  joinedAt: string | null;
}

export interface PublicUser {
  id: string;
  publicName: string;
  publicBio: string;
  isFounder: boolean;
  isSeeker: boolean;
  availability: Availability;
  field: string | null;
  skills: string[];
  interests: string[];
  location: PublicLocation;
  socials: PublicSocials;
  contributionCount: number;
  successRate: number | null;
  eligibility: string;
  currentProjects: PublicCurrentProject[];
}

export interface ProfilePayload {
  email?: string;
  password?: string;
  publicName: string;
  publicBio: string;
  isFounder: boolean;
  isSeeker: boolean;
  availability: Availability;
  location: {
    city: string;
    region: string;
    country: string;
  };
  field: string;
  precision: LocationPrecision;
  skills: string[];
  interests: string;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  portfolioUrl?: string | null;
  contributionCount?: number;
  successRate?: number | null;
  eligibility?: string;
}
