import { Bot, ClipboardList, FileText, Handshake, Home, Inbox, Lightbulb, UserRound, type LucideIcon } from "lucide-react";

export type AppPageId = "onboarding" | "consultant" | "workspace" | "thesis" | "matching" | "myWork" | "messages" | "profile";

export interface NavItem {
  id: AppPageId;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "প্রধান",
    items: [{ id: "onboarding", label: "হোম", icon: Home }]
  },
  {
    label: "তৈরি করুন",
    items: [
      { id: "consultant", label: "কনসালট্যান্ট", icon: Bot },
      { id: "workspace", label: "ওয়ার্কস্পেস", icon: Lightbulb },
      { id: "thesis", label: "থিসিস", icon: FileText }
    ]
  },
  {
    label: "সংযোগ",
    items: [
      { id: "matching", label: "ম্যাচিং", icon: Handshake },
      { id: "myWork", label: "আমার কাজ", icon: ClipboardList },
      { id: "messages", label: "মেসেজ", icon: Inbox }
    ]
  },
  {
    label: "অ্যাকাউন্ট",
    items: [{ id: "profile", label: "প্রোফাইল", icon: UserRound }]
  }
];

export const pages: NavItem[] = navGroups.flatMap((group) => group.items);

export type PageId = AppPageId | "landing" | "login" | "register" | "candidate" | "user";
