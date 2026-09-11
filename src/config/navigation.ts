import { Bot, FileText, Handshake, Home, Inbox, Lightbulb, LogIn, UserRound } from "lucide-react";

export const pages = [
  { id: "onboarding", label: "শুরু", icon: Home },
  { id: "login", label: "লগইন", icon: LogIn },
  { id: "consultant", label: "কনসালট্যান্ট", icon: Bot },
  { id: "workspace", label: "ওয়ার্কস্পেস", icon: Lightbulb },
  { id: "thesis", label: "থিসিস", icon: FileText },
  { id: "matching", label: "ম্যাচিং", icon: Handshake },
  { id: "messages", label: "মেসেজ", icon: Inbox },
  { id: "profile", label: "প্রোফাইল", icon: UserRound }
] as const;

export type PageId = (typeof pages)[number]["id"];
