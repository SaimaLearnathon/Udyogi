export interface IncomingRequest {
  id: string;
  status: "pending" | "accepted" | "declined";
  skillTag: string | null;
  message: string | null;
  createdAt: string;
  founder: {
    id: string;
    publicName: string;
    publicBio: string;
  };
  idea: {
    title: string;
    pitch: string;
  };
}
