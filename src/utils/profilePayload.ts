import type { ProfilePayload, PublicUser } from "../types/profile";

export function userToProfilePayload(user: PublicUser): ProfilePayload {
  return {
    publicName: user.publicName,
    publicBio: user.publicBio,
    isFounder: user.isFounder,
    isSeeker: user.isSeeker,
    availability: user.availability,
    location: {
      city: user.location.city ?? "",
      region: user.location.region ?? "",
      country: user.location.country ?? "Bangladesh"
    },
    field: user.field ?? "",
    precision: "city",
    skills: user.skills,
    interests: user.interests.join(", ")
  };
}
