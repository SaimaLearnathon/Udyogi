import { GoogleGenAI, Type, type FunctionDeclaration } from "@google/genai";
import { env } from "../../config/env.js";

export type ConsultantMode = "ideation" | "validation";

let client: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
}

export const PROPOSE_THESIS_FUNCTION = "propose_thesis";

export const thesisFunctionDeclaration: FunctionDeclaration = {
  name: PROPOSE_THESIS_FUNCTION,
  description:
    "কথোপকথন থেকে পর্যাপ্ত তথ্য সংগ্রহ হলে, একটি সম্পূর্ণ কাঠামোবদ্ধ স্টার্টআপ থিসিস ড্রাফট জমা দিতে এই ফাংশন কল করুন। এটি ব্যবহারকারীকে দেখানো হবে এবং তার ওয়ার্কস্পেসে সংরক্ষিত হবে।",
  parameters: {
    type: Type.OBJECT,
    properties: {
      idea_summary: {
        type: Type.OBJECT,
        description: "আইডিয়ার সারসংক্ষেপ",
        properties: {
          problem: { type: Type.STRING, description: "যে সমস্যাটি সমাধান করা হচ্ছে" },
          solution: { type: Type.STRING, description: "প্রস্তাবিত সমাধান" },
          target_customer: { type: Type.STRING, description: "লক্ষ্য গ্রাহক" },
          value_proposition: { type: Type.STRING, description: "মূল্য প্রস্তাবনা" }
        },
        required: ["problem", "solution", "target_customer", "value_proposition"]
      },
      feasibility_assessment: {
        type: Type.OBJECT,
        description: "সম্ভাব্যতা মূল্যায়ন",
        properties: {
          rating: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          rationale: { type: Type.STRING, description: "রেটিং এর কারণ" }
        },
        required: ["rating", "rationale"]
      },
      market_analysis: {
        type: Type.OBJECT,
        description: "বাজার বিশ্লেষণ ও প্রতিযোগী",
        properties: {
          market_description: { type: Type.STRING },
          target_segment: { type: Type.STRING },
          competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
          differentiation: { type: Type.STRING, description: "প্রতিযোগীদের থেকে পার্থক্য" }
        },
        required: ["market_description", "target_segment", "competitors", "differentiation"]
      },
      licensing_notes: {
        type: Type.STRING,
        description: "লাইসেন্সিং ও আইনি বিবেচনা - শুধুমাত্র তথ্যভিত্তিক, আইনি পরামর্শ নয়"
      },
      mvp_roadmap: {
        type: Type.ARRAY,
        description: "MVP রোডম্যাপ ধাপসমূহ",
        items: {
          type: Type.OBJECT,
          properties: {
            phase: { type: Type.STRING },
            description: { type: Type.STRING },
            estimated_timeframe: { type: Type.STRING }
          },
          required: ["phase", "description", "estimated_timeframe"]
        }
      },
      financial_evaluation: {
        type: Type.OBJECT,
        description: "আর্থিক মূল্যায়ন - শুধুমাত্র তথ্যভিত্তিক, আর্থিক পরামর্শ নয়",
        properties: {
          estimated_cost_categories: { type: Type.ARRAY, items: { type: Type.STRING } },
          revenue_model: { type: Type.STRING },
          runway_notes: { type: Type.STRING }
        },
        required: ["estimated_cost_categories", "revenue_model", "runway_notes"]
      },
      required_resources: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "প্রয়োজনীয় সম্পদ (তহবিল, টুলস, অংশীদারিত্ব ইত্যাদি)"
      },
      required_skillsets: {
        type: Type.ARRAY,
        description: "দলের জন্য প্রয়োজনীয় দক্ষতা",
        items: {
          type: Type.OBJECT,
          properties: {
            skill_tag: { type: Type.STRING },
            description: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
          },
          required: ["skill_tag", "description", "priority"]
        }
      }
    },
    required: [
      "idea_summary",
      "feasibility_assessment",
      "market_analysis",
      "licensing_notes",
      "mvp_roadmap",
      "financial_evaluation",
      "required_resources",
      "required_skillsets"
    ]
  }
};

export const REQUEST_CONFIRMATION_FUNCTION = "request_confirmation";

export const requestConfirmationFunctionDeclaration: FunctionDeclaration = {
  name: REQUEST_CONFIRMATION_FUNCTION,
  description:
    "প্রাথমিক অনুসন্ধান (ধাপ ১) শেষে তোমার সারাংশ ও প্রশ্নের পরে ব্যবহারকারীকে একটি নিশ্চিতকরণ বোতাম দেখানোর জন্য এই ফাংশন কল কর, যাতে সে টাইপ না করে সরাসরি বোতাম চেপে বিস্তারিত থিসিস তৈরিতে এগিয়ে যেতে পারে বা আরও তথ্য যোগ করতে পারে।"
};

const SHARED_INSTRUCTION = `
তুমি "উদ্যোগী" প্ল্যাটফর্মের AI স্টার্টআপ কনসালট্যান্ট। তুমি বাংলাদেশের উদ্যোক্তাদের সাথে কথা বলছ।

সাধারণ নিয়ম:
- সবসময় বাংলায় কথা বল, বন্ধুত্বপূর্ণ কিন্তু পেশাদার এবং বাস্তবমুখী থাক।
- একবারে একটি প্রশ্ন কর, বড় প্রশ্নের তালিকা দিও না।
- আইনি বা আর্থিক পরামর্শ দেওয়ার সময় স্পষ্ট করে বল যে এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি বা আর্থিক পরামর্শ নয়।

কথোপকথন দুটি ধাপে পরিচালনা কর:

ধাপ ১ - প্রাথমিক অনুসন্ধান (প্রায় ৪-৫টি প্রশ্ন):
- মূল বিষয়গুলো জানতে মোটামুটি ৪-৫টি গুরুত্বপূর্ণ প্রশ্ন কর (প্রয়োজন অনুযায়ী সামান্য কমবেশি হতে পারে, এটি তোমার বিচারবুদ্ধির উপর নির্ভরশীল): মূল সমস্যা, প্রস্তাবিত সমাধান/পণ্য, লক্ষ্য গ্রাহক, ব্যবহারকারীর প্রাসঙ্গিক দক্ষতা ও সম্পদ, এবং মোটাদাগে বাজার/প্রতিযোগিতা সম্পর্কে তার ধারণা।
- এই প্রশ্নগুলোর উত্তর পাওয়ার পর, ${PROPOSE_THESIS_FUNCTION} ফাংশন কল না করে একটি সংক্ষিপ্ত সারাংশ দাও (কয়েক লাইনে: সমস্যা, সমাধান, লক্ষ্য গ্রাহক, প্রাথমিক সম্ভাব্যতা), তারপর ${REQUEST_CONFIRMATION_FUNCTION} ফাংশন কল কর যাতে ব্যবহারকারী টাইপ না করে বোতাম চেপে বিস্তারিত বিশ্লেষণে (বাজার বিশ্লেষণ, প্রতিযোগী, আর্থিক মূল্যায়ন, MVP পরিকল্পনা, আইনি বিবেচনা, প্রয়োজনীয় দক্ষতা) এগিয়ে যেতে পারে। সারাংশের পর প্রশ্নটি টেক্সটে লিখে জিজ্ঞাসা কোরো না - ${REQUEST_CONFIRMATION_FUNCTION} কলটিই সেই জিজ্ঞাসা।
- ব্যবহারকারী "আরও যোগ করতে চাই" জাতীয় বার্তা পাঠালে, ধাপ ১-এ থেকে আরও প্রশ্ন কর এবং কোনো ফাংশন কল কোরো না।

ধাপ ২ - সম্পূর্ণ থিসিস (নিশ্চিতকরণের পরেই):
- ব্যবহারকারী "হ্যাঁ, বিস্তারিত বিশ্লেষণ করে এগিয়ে যান" জাতীয় বার্তা পাঠালেই কেবল, বাকি বিষয়গুলো নিয়ে প্রয়োজনে আরও ১-২টি প্রশ্ন কর অথবা যুক্তিসঙ্গত অনুমান দিয়ে ফাঁক পূরণ কর, তারপর ${PROPOSE_THESIS_FUNCTION} ফাংশন কল করে বাজার বিশ্লেষণ, প্রতিযোগী, সম্ভাব্যতা, আর্থিক মূল্যায়ন, প্রয়োজনীয় সম্পদ, MVP রোডম্যাপ, লাইসেন্সিং/আইনি বিবেচনা ও প্রয়োজনীয় দক্ষতাসহ সম্পূর্ণ কাঠামোবদ্ধ থিসিস জমা দাও।
- ব্যবহারকারীর স্পষ্ট সম্মতি ছাড়া কখনও ${PROPOSE_THESIS_FUNCTION} কল কোরো না।
- ফাংশন কল করার পর, ব্যবহারকারীকে সংক্ষেপে বাংলায় জানাও যে থিসিসের একটি বিস্তারিত খসড়া তৈরি হয়েছে এবং তারা এটি ওয়ার্কস্পেসে পর্যালোচনা করতে পারবে।
- ব্যবহারকারী যদি পরবর্তীতে আরও তথ্য দেয় বা পরিবর্তন চায়, প্রয়োজনে ${PROPOSE_THESIS_FUNCTION} আবার কল করে একটি হালনাগাদ সংস্করণ জমা দিতে পার।
`;

const MODE_INSTRUCTION: Record<ConsultantMode, string> = {
  ideation: `মোড: আইডিয়েশন। ব্যবহারকারীর এখনো নির্দিষ্ট কোনো আইডিয়া নাও থাকতে পারে। তার দক্ষতা, আগ্রহ, অভিজ্ঞতা, সম্পদ ও ঝুঁকি নেওয়ার সক্ষমতা জেনে সম্ভাব্য স্টার্টআপ আইডিয়া খুঁজে বের করতে সাহায্য কর।`,
  validation: `মোড: ভ্যালিডেশন। ব্যবহারকারীর ইতিমধ্যে একটি আইডিয়া আছে। গভীরভাবে জিজ্ঞাসাবাদ করে সেটির সম্ভাব্যতা, বাজার উপযোগিতা এবং ঝুঁকি যাচাই কর।`
};

export function systemInstructionFor(mode: ConsultantMode): string {
  return `${SHARED_INSTRUCTION}\n\n${MODE_INSTRUCTION[mode]}`;
}
