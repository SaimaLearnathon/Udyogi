import type { Availability, LocationPrecision } from "../types/profile";

export const availabilityOptions: Array<{ value: Availability; label: string }> = [
  { value: "full_time", label: "পূর্ণকালীন" },
  { value: "part_time", label: "আংশিক সময়" },
  { value: "advisor", label: "পরামর্শক" }
];

export const precisionOptions: Array<{ value: LocationPrecision; label: string }> = [
  { value: "exact", label: "নির্দিষ্ট" },
  { value: "city", label: "শহর" },
  { value: "region", label: "বিভাগ" }
];

export const fieldOptions = ["এগ্রিটেক", "হেলথটেক", "এডটেক", "ফিনটেক", "কমার্স", "লজিস্টিকস"];
export const skillOptions = ["প্রোডাক্ট", "ডিজাইন", "মার্কেটিং", "সফটওয়্যার", "অপারেশনস", "সেলস"];
