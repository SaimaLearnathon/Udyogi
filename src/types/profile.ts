export type Availability = "full_time" | "part_time" | "advisor";
export type LocationPrecision = "exact" | "city" | "region";

export interface PublicLocation {
  city: string | null;
  region: string | null;
  country: string | null;
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
}
