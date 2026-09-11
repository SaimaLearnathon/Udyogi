import { pool } from "../src/db/pool.js";
import { hashPassword } from "../src/modules/auth/password.js";
import { emailLookup } from "../src/modules/auth/session.js";
import { normalizeBengaliText } from "../src/utils/text.js";

interface DemoUser {
  email: string;
  publicName: string;
  publicBio: string;
  isFounder: boolean;
  isSeeker: boolean;
  availability: "full_time" | "part_time" | "advisor";
  field: string;
  city: string;
  region: string;
  skills: string[];
  customSkills: string[];
  linkedinUrl?: string;
  facebookUrl?: string;
  portfolioUrl?: string;
  contributionCount?: number;
  successRate?: number;
  eligibility?: string;
}

interface DemoThesis {
  founderEmail: string;
  parsedData: {
    idea_summary: { problem: string; solution: string; target_customer: string; value_proposition: string };
    feasibility_assessment: { rating: "Low" | "Medium" | "High"; rationale: string };
    market_analysis: { market_description: string; target_segment: string; competitors: string[]; differentiation: string };
    licensing_notes: string;
    mvp_roadmap: { phase: string; description: string; estimated_timeframe: string }[];
    financial_evaluation: { estimated_cost_categories: string[]; revenue_model: string; runway_notes: string };
    required_resources: string[];
    required_skillsets: { skill_tag: string; description: string; priority: "High" | "Medium" | "Low" }[];
  };
}

const PASSWORD = "demopass123";

const demoUsers: DemoUser[] = [
  {
    email: "rakib.demo@uddogi.test",
    publicName: "রাকিব হাসান",
    publicBio: "৬ বছরের এগ্রিটেক অভিজ্ঞতা, কৃষক সমবায়ের সাথে কাজ করেছি।",
    isFounder: true,
    isSeeker: false,
    availability: "full_time",
    field: "এগ্রিটেক",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: ["প্রোডাক্ট"],
    customSkills: []
  },
  {
    email: "tanvir.demo@uddogi.test",
    publicName: "তানভীর আহমেদ",
    publicBio: "ফিনটেক প্রোডাক্ট ম্যানেজার, আগে দুটি পেমেন্ট স্টার্টআপে কাজ করেছি।",
    isFounder: true,
    isSeeker: false,
    availability: "full_time",
    field: "ফিনটেক",
    city: "চট্টগ্রাম",
    region: "চট্টগ্রাম",
    skills: ["প্রোডাক্ট"],
    customSkills: []
  },
  {
    email: "sadia.demo@uddogi.test",
    publicName: "সাদিয়া রহমান",
    publicBio: "স্বাস্থ্যখাতে অপারেশনস বিশেষজ্ঞ, টেলি-মেডিসিন নিয়ে আগ্রহী।",
    isFounder: true,
    isSeeker: false,
    availability: "full_time",
    field: "হেলথটেক",
    city: "সিলেট",
    region: "সিলেট",
    skills: ["অপারেশনস"],
    customSkills: []
  },
  {
    email: "nafis.demo@uddogi.test",
    publicName: "নাফিস ইকবাল",
    publicBio: "৪ বছরের ব্যাকএন্ড ডেভেলপার, নতুন স্টার্টআপে যোগ দিতে আগ্রহী।",
    isFounder: false,
    isSeeker: true,
    availability: "full_time",
    field: "ফিনটেক",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: ["সফটওয়্যার"],
    customSkills: ["ব্যাকএন্ড ডেভেলপার"],
    linkedinUrl: "https://linkedin.com/in/nafis-iqbal-demo",
    portfolioUrl: "https://nafis-iqbal.dev",
    contributionCount: 6,
    successRate: 88,
    eligibility: "কম্পিউটার সায়েন্স স্নাতক, ৪ বছরের অভিজ্ঞতা"
  },
  {
    email: "mitu.demo@uddogi.test",
    publicName: "মিতু আক্তার",
    publicBio: "UI/UX ডিজাইনার, মোবাইল অ্যাপ ডিজাইনে বিশেষজ্ঞ।",
    isFounder: false,
    isSeeker: true,
    availability: "part_time",
    field: "কমার্স",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: ["ডিজাইন"],
    customSkills: ["UI/UX ডিজাইনার"],
    linkedinUrl: "https://linkedin.com/in/mitu-akter-demo",
    portfolioUrl: "https://dribbble.com/mituakter",
    contributionCount: 9,
    successRate: 92,
    eligibility: "গ্রাফিক ডিজাইনে ডিপ্লোমা, ৩ বছরের অভিজ্ঞতা"
  },
  {
    email: "kamrul.demo@uddogi.test",
    publicName: "কামরুল হাসান",
    publicBio: "গ্রোথ মার্কেটিং ও সোশ্যাল মিডিয়া ক্যাম্পেইনে অভিজ্ঞ।",
    isFounder: false,
    isSeeker: true,
    availability: "full_time",
    field: "কমার্স",
    city: "খুলনা",
    region: "খুলনা",
    skills: ["মার্কেটিং"],
    customSkills: ["মার্কেটিং এক্সিকিউটিভ"],
    facebookUrl: "https://facebook.com/kamrul.hasan.demo",
    contributionCount: 4,
    successRate: 75,
    eligibility: "বিবিএ (মার্কেটিং), ৩ বছরের অভিজ্ঞতা"
  },
  {
    email: "shahriar.demo@uddogi.test",
    publicName: "শাহরিয়ার নাফিজ",
    publicBio: "সাপ্লাই চেইন ও লজিস্টিকস অপারেশনসে ৫ বছরের অভিজ্ঞতা।",
    isFounder: false,
    isSeeker: true,
    availability: "full_time",
    field: "লজিস্টিকস",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: ["অপারেশনস"],
    customSkills: ["লজিস্টিকস ম্যানেজার"],
    linkedinUrl: "https://linkedin.com/in/shahriar-nafiz-demo",
    contributionCount: 7,
    successRate: 81,
    eligibility: "বিবিএ, ৫ বছরের সাপ্লাই চেইন অভিজ্ঞতা"
  },
  {
    email: "farzana.demo@uddogi.test",
    publicName: "ফারজানা ইয়াসমিন",
    publicBio: "চার্টার্ড অ্যাকাউন্ট্যান্ট, স্টার্টআপ ফাইন্যান্স নিয়ে কাজ করতে চাই।",
    isFounder: false,
    isSeeker: true,
    availability: "part_time",
    field: "কমার্স",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: [],
    customSkills: ["অ্যাকাউন্ট্যান্ট"],
    linkedinUrl: "https://linkedin.com/in/farzana-yasmin-demo",
    contributionCount: 5,
    successRate: 90,
    eligibility: "CA (সনদপ্রাপ্ত), ৬ বছরের অভিজ্ঞতা"
  },
  {
    email: "nusrat.demo@uddogi.test",
    publicName: "নুসরাত জাহান",
    publicBio: "ক্লিনিক্যাল সাইকোলজিস্ট, শিক্ষার্থীদের মানসিক স্বাস্থ্য নিয়ে কাজ করি।",
    isFounder: false,
    isSeeker: true,
    availability: "part_time",
    field: "হেলথটেক",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: [],
    customSkills: ["ক্লিনিক্যাল সাইকোলজিস্ট"],
    linkedinUrl: "https://linkedin.com/in/nusrat-jahan-demo",
    contributionCount: 3,
    successRate: 95,
    eligibility: "ক্লিনিক্যাল সাইকোলজিতে স্নাতকোত্তর, লাইসেন্সপ্রাপ্ত"
  },
  {
    email: "imran.demo@uddogi.test",
    publicName: "ইমরান খান",
    publicBio: "কমপ্লায়েন্স ও রেগুলেটরি অ্যাফেয়ার্সে ৬ বছরের অভিজ্ঞতা, ফিনটেক ও হেলথটেক নিয়ন্ত্রক প্রক্রিয়ায় দক্ষ।",
    isFounder: false,
    isSeeker: true,
    availability: "advisor",
    field: "ফিনটেক",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: [],
    customSkills: ["কমপ্লায়েন্স অফিসার"],
    linkedinUrl: "https://linkedin.com/in/imran-khan-demo",
    contributionCount: 8,
    successRate: 84,
    eligibility: "আইন স্নাতক, ৬ বছরের কমপ্লায়েন্স অভিজ্ঞতা"
  },
  {
    email: "labiba.demo@uddogi.test",
    publicName: "লাবিবা সুলতানা",
    publicBio: "শিক্ষা উপকরণ ডিজাইনার, মাধ্যমিক পর্যায়ের কারিকুলাম নিয়ে কাজ করেছি।",
    isFounder: false,
    isSeeker: true,
    availability: "part_time",
    field: "এডটেক",
    city: "রাজশাহী",
    region: "রাজশাহী",
    skills: [],
    customSkills: ["কারিকুলাম বিশেষজ্ঞ"],
    facebookUrl: "https://facebook.com/labiba.sultana.demo",
    contributionCount: 5,
    successRate: 87,
    eligibility: "শিক্ষায় স্নাতকোত্তর, ৪ বছরের কারিকুলাম উন্নয়ন অভিজ্ঞতা"
  },
  {
    email: "arif.demo@uddogi.test",
    publicName: "আরিফ হোসেন",
    publicBio: "ভিডিও এডিটর ও কনটেন্ট নির্মাতা, ইউটিউব ও শিক্ষামূলক ভিডিওতে অভিজ্ঞ।",
    isFounder: false,
    isSeeker: true,
    availability: "full_time",
    field: "এডটেক",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: ["প্রোডাক্ট"],
    customSkills: ["ভিডিও এডিটর"],
    portfolioUrl: "https://youtube.com/@arifhossain-demo",
    contributionCount: 12,
    successRate: 79,
    eligibility: "মিডিয়া স্টাডিজ স্নাতক, ৩ বছরের অভিজ্ঞতা"
  },
  {
    email: "priyanka.demo@uddogi.test",
    publicName: "প্রিয়াঙ্কা দাস",
    publicBio: "ডেটা সায়েন্টিস্ট, শিক্ষা ও স্বাস্থ্য খাতের ডেটা বিশ্লেষণে আগ্রহী।",
    isFounder: false,
    isSeeker: true,
    availability: "full_time",
    field: "এডটেক",
    city: "ঢাকা",
    region: "ঢাকা",
    skills: ["সফটওয়্যার"],
    customSkills: ["ডেটা সায়েন্টিস্ট"],
    linkedinUrl: "https://linkedin.com/in/priyanka-das-demo",
    contributionCount: 4,
    successRate: 91,
    eligibility: "পরিসংখ্যানে স্নাতকোত্তর, ৩ বছরের ডেটা সায়েন্স অভিজ্ঞতা"
  },
  {
    email: "tariq.demo@uddogi.test",
    publicName: "তারিক আজিজ",
    publicBio: "সেলস ও বিজনেস ডেভেলপমেন্টে ৫ বছরের অভিজ্ঞতা, স্কুল ও প্রতিষ্ঠানের সাথে পার্টনারশিপে দক্ষ।",
    isFounder: false,
    isSeeker: true,
    availability: "full_time",
    field: "কমার্স",
    city: "চট্টগ্রাম",
    region: "চট্টগ্রাম",
    skills: ["সেলস"],
    customSkills: ["সেলস এক্সিকিউটিভ"],
    linkedinUrl: "https://linkedin.com/in/tariq-aziz-demo",
    contributionCount: 6,
    successRate: 82,
    eligibility: "বিবিএ, ৫ বছরের সেলস অভিজ্ঞতা"
  }
];

const demoTheses: DemoThesis[] = [
  {
    founderEmail: "rakib.demo@uddogi.test",
    parsedData: {
      idea_summary: {
        problem: "ক্ষুদ্র কৃষকরা ন্যায্যমূল্যে ফসল বিক্রি করতে পারেন না, মধ্যস্বত্বভোগীদের কারণে লাভের বড় অংশ হারান।",
        solution: "কৃষক ও খুচরা বিক্রেতাদের সরাসরি সংযুক্ত করা একটি মোবাইল প্ল্যাটফর্ম, যেখানে ফসলের তথ্য, দাম ও সরবরাহ সময়সূচি স্বচ্ছভাবে দেখা যাবে।",
        target_customer: "ঢাকার আশেপাশের ক্ষুদ্র ও মাঝারি কৃষক এবং শহরের খুচরা মুদি দোকান।",
        value_proposition: "কৃষি পণ্যের সরাসরি বাজার সংযোগ প্ল্যাটফর্ম"
      },
      feasibility_assessment: {
        rating: "High",
        rationale: "প্রতিষ্ঠাতার কৃষি খাতে সরাসরি অভিজ্ঞতা আছে এবং সমস্যাটি স্পষ্টভাবে যাচাইযোগ্য।"
      },
      market_analysis: {
        market_description: "বাংলাদেশের কৃষি সরবরাহ চেইন এখনো মূলত অফলাইন ও মধ্যস্বত্বভোগী নির্ভর।",
        target_segment: "ঢাকা বিভাগের সবজি ও ফল চাষী এবং শহুরে খুচরা বিক্রেতা।",
        competitors: ["ফসল হাট", "কৃষকবাজার"],
        differentiation: "সরাসরি লজিস্টিকস সমন্বয় ও স্বচ্ছ মূল্য নির্ধারণ ব্যবস্থা।"
      },
      licensing_notes:
        "খাদ্যপণ্য সরবরাহের জন্য স্থানীয় ট্রেড লাইসেন্স ও প্রযোজ্য ক্ষেত্রে BSTI অনুমোদন প্রয়োজন হতে পারে। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি পরামর্শ নয়।",
      mvp_roadmap: [
        { phase: "ধাপ ১", description: "একটি জেলায় ৫০ জন কৃষক ও ২০ জন খুচরা বিক্রেতা নিয়ে পাইলট চালু।", estimated_timeframe: "২ মাস" },
        { phase: "ধাপ ২", description: "পেমেন্ট ও ডেলিভারি সমন্বয় ফিচার যুক্ত করা।", estimated_timeframe: "৩ মাস" },
        { phase: "ধাপ ৩", description: "৩টি জেলায় সম্প্রসারণ।", estimated_timeframe: "৬ মাস" }
      ],
      financial_evaluation: {
        estimated_cost_categories: ["অ্যাপ ডেভেলপমেন্ট", "লজিস্টিকস", "মার্কেটিং", "টিম বেতন"],
        revenue_model: "প্রতি লেনদেনে কমিশন ভিত্তিক আয়।",
        runway_notes: "প্রাথমিক পুঁজিতে প্রায় ৮-১০ মাস চালানো সম্ভব। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আর্থিক পরামর্শ নয়।"
      },
      required_resources: ["প্রাথমিক পুঁজি", "লজিস্টিকস পার্টনার", "মোবাইল অ্যাপ ইনফ্রাস্ট্রাকচার"],
      required_skillsets: [
        { skill_tag: "সফটওয়্যার ডেভেলপার", description: "মোবাইল ও ব্যাকএন্ড অ্যাপ তৈরি করবেন।", priority: "High" },
        { skill_tag: "লজিস্টিকস ম্যানেজার", description: "সরবরাহ ও ডেলিভারি নেটওয়ার্ক সমন্বয় করবেন।", priority: "High" },
        { skill_tag: "মার্কেটিং এক্সিকিউটিভ", description: "কৃষক ও খুচরা বিক্রেতাদের মধ্যে প্ল্যাটফর্মটি প্রচার করবেন।", priority: "Medium" },
        { skill_tag: "অ্যাকাউন্ট্যান্ট", description: "লেনদেন ও কমিশন হিসাব ব্যবস্থাপনা করবেন।", priority: "Medium" },
        { skill_tag: "কৃষি বিশেষজ্ঞ", description: "ফসলের গুণমান যাচাই ও কৃষক প্রশিক্ষণে সহায়তা করবেন।", priority: "Low" }
      ]
    }
  },
  {
    founderEmail: "tanvir.demo@uddogi.test",
    parsedData: {
      idea_summary: {
        problem: "ক্ষুদ্র ব্যবসায়ীরা এখনো খাতা-কলমে হিসাব রাখেন এবং ডিজিটাল পেমেন্ট গ্রহণে জটিলতার সম্মুখীন হন।",
        solution: "একটি সহজ মোবাইল অ্যাপ যা POS, ডিজিটাল পেমেন্ট গ্রহণ ও স্বয়ংক্রিয় হিসাব রাখার সুবিধা দেবে।",
        target_customer: "চট্টগ্রামের ছোট দোকান ও সার্ভিস ব্যবসায়ীরা।",
        value_proposition: "ক্ষুদ্র ব্যবসায়ীদের জন্য ডিজিটাল পেমেন্ট ও হিসাব সমাধান"
      },
      feasibility_assessment: {
        rating: "Medium",
        rationale: "বাজারের চাহিদা স্পষ্ট, তবে পেমেন্ট গেটওয়ে নিয়ন্ত্রক অনুমোদন প্রক্রিয়া সময়সাপেক্ষ হতে পারে।"
      },
      market_analysis: {
        market_description: "বাংলাদেশে ডিজিটাল পেমেন্ট গ্রহণকারী ক্ষুদ্র ব্যবসায়ীর সংখ্যা দ্রুত বাড়ছে।",
        target_segment: "চট্টগ্রাম ও আশেপাশের শহরের খুচরা ও সার্ভিস ব্যবসা।",
        competitors: ["bKash Merchant", "Nagad Merchant"],
        differentiation: "পেমেন্টের পাশাপাশি স্বয়ংক্রিয় হিসাব ও ইনভেন্টরি ট্র্যাকিং একসাথে দেওয়া।"
      },
      licensing_notes:
        "পেমেন্ট সার্ভিস প্রোভাইডার হিসেবে কাজ করতে বাংলাদেশ ব্যাংকের প্রযোজ্য নিয়ন্ত্রক অনুমোদন প্রয়োজন হতে পারে। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি পরামর্শ নয়।",
      mvp_roadmap: [
        { phase: "ধাপ ১", description: "মৌলিক POS ও হিসাব ফিচার নিয়ে ২০টি দোকানে পাইলট।", estimated_timeframe: "২ মাস" },
        { phase: "ধাপ ২", description: "বিদ্যমান মোবাইল ব্যাংকিং সেবার সাথে ইন্টিগ্রেশন।", estimated_timeframe: "৩ মাস" },
        { phase: "ধাপ ৩", description: "চট্টগ্রামজুড়ে সম্প্রসারণ।", estimated_timeframe: "৪ মাস" }
      ],
      financial_evaluation: {
        estimated_cost_categories: ["অ্যাপ ডেভেলপমেন্ট", "কমপ্লায়েন্স ও লাইসেন্সিং", "কাস্টমার সাপোর্ট"],
        revenue_model: "মাসিক সাবস্ক্রিপশন ফি ও লেনদেন ভিত্তিক ছোট চার্জ।",
        runway_notes: "নিয়ন্ত্রক অনুমোদন পেতে অতিরিক্ত সময় লাগতে পারে বিধায় ১২ মাসের রানওয়ে পরিকল্পনা করা উচিত। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আর্থিক পরামর্শ নয়।"
      },
      required_resources: ["প্রাথমিক পুঁজি", "পেমেন্ট গেটওয়ে অংশীদারিত্ব", "কমপ্লায়েন্স পরামর্শক"],
      required_skillsets: [
        { skill_tag: "ব্যাকএন্ড ডেভেলপার", description: "পেমেন্ট সিস্টেম ও API তৈরি করবেন।", priority: "High" },
        { skill_tag: "UI/UX ডিজাইনার", description: "সহজবোধ্য অ্যাপ ইন্টারফেস ডিজাইন করবেন।", priority: "High" },
        { skill_tag: "কমপ্লায়েন্স অফিসার", description: "নিয়ন্ত্রক প্রয়োজনীয়তা পূরণ নিশ্চিত করবেন।", priority: "High" },
        { skill_tag: "সেলস ম্যানেজার", description: "নতুন দোকান ও মার্চেন্ট অন্তর্ভুক্ত করবেন।", priority: "Medium" },
        { skill_tag: "কাস্টমার সাপোর্ট এক্সিকিউটিভ", description: "মার্চেন্ট সহায়তা ও সমস্যা সমাধান করবেন।", priority: "Low" }
      ]
    }
  },
  {
    founderEmail: "sadia.demo@uddogi.test",
    parsedData: {
      idea_summary: {
        problem: "গ্রামীণ এলাকায় বিশেষজ্ঞ চিকিৎসকের অভাব এবং ওষুধ সংগ্রহে দীর্ঘ ভ্রমণের প্রয়োজন হয়।",
        solution: "টেলি-মেডিসিন পরামর্শ ও ওষুধ হোম ডেলিভারি একত্রিত করা একটি মোবাইল স্বাস্থ্যসেবা প্ল্যাটফর্ম।",
        target_customer: "সিলেট বিভাগের গ্রামীণ ও আধা-শহুরে পরিবার।",
        value_proposition: "টেলি-মেডিসিন ও ওষুধ ডেলিভারি সমন্বিত স্বাস্থ্যসেবা অ্যাপ"
      },
      feasibility_assessment: {
        rating: "Medium",
        rationale: "চাহিদা স্পষ্ট, তবে গ্রামীণ ইন্টারনেট সংযোগ ও ডেলিভারি নেটওয়ার্ক গড়ে তোলা চ্যালেঞ্জিং।"
      },
      market_analysis: {
        market_description: "বাংলাদেশে টেলি-মেডিসিন ব্যবহারকারীর সংখ্যা কোভিড-পরবর্তী সময়ে উল্লেখযোগ্যভাবে বেড়েছে।",
        target_segment: "সিলেট বিভাগের গ্রামীণ পরিবার ও প্রবীণ জনগোষ্ঠী।",
        competitors: ["Doctorola", "DoctorTime"],
        differentiation: "পরামর্শ ও ওষুধ ডেলিভারি একই প্ল্যাটফর্মে সমন্বিত, স্থানীয় ভাষায় সহায়তা।"
      },
      licensing_notes:
        "টেলি-মেডিসিন সেবা প্রদানে স্বাস্থ্য অধিদপ্তরের নিয়ন্ত্রক অনুমোদন ও ফার্মেসি লাইসেন্স প্রয়োজন হতে পারে। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি পরামর্শ নয়।",
      mvp_roadmap: [
        { phase: "ধাপ ১", description: "৩ জন চিকিৎসক ও ১টি ফার্মেসি পার্টনার নিয়ে পাইলট।", estimated_timeframe: "৩ মাস" },
        { phase: "ধাপ ২", description: "ডেলিভারি নেটওয়ার্ক ও পেমেন্ট ইন্টিগ্রেশন।", estimated_timeframe: "৩ মাস" },
        { phase: "ধাপ ৩", description: "সিলেট বিভাগজুড়ে সম্প্রসারণ।", estimated_timeframe: "৬ মাস" }
      ],
      financial_evaluation: {
        estimated_cost_categories: ["প্ল্যাটফর্ম ডেভেলপমেন্ট", "ডেলিভারি নেটওয়ার্ক", "চিকিৎসক সম্মানী"],
        revenue_model: "পরামর্শ ফি থেকে কমিশন ও ওষুধ ডেলিভারিতে সার্ভিস চার্জ।",
        runway_notes: "স্বাস্থ্যখাতে নিয়ন্ত্রক প্রক্রিয়ার কারণে ১২-১৫ মাসের রানওয়ে পরিকল্পনা প্রয়োজন। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আর্থিক পরামর্শ নয়।"
      },
      required_resources: ["প্রাথমিক পুঁজি", "চিকিৎসক নেটওয়ার্ক", "ফার্মেসি অংশীদারিত্ব"],
      required_skillsets: [
        { skill_tag: "মোবাইল অ্যাপ ডেভেলপার", description: "ভিডিও কল ও অ্যাপ ফিচার তৈরি করবেন।", priority: "High" },
        { skill_tag: "স্বাস্থ্যকর্মী পরামর্শক", description: "চিকিৎসক নেটওয়ার্ক ও সেবার মান তদারকি করবেন।", priority: "High" },
        { skill_tag: "অপারেশনস ম্যানেজার", description: "ডেলিভারি ও লজিস্টিকস নেটওয়ার্ক পরিচালনা করবেন।", priority: "Medium" },
        { skill_tag: "গ্রাফিক ডিজাইনার", description: "অ্যাপ ও প্রচারণার ভিজ্যুয়াল ডিজাইন করবেন।", priority: "Low" },
        { skill_tag: "লিগ্যাল অ্যাডভাইজার", description: "স্বাস্থ্যখাতের নিয়ন্ত্রক প্রয়োজনীয়তা যাচাই করবেন।", priority: "Medium" }
      ]
    }
  }
];

async function upsertUser(user: DemoUser) {
  const existing = await pool.query<{ id: string }>("select id from users where email_lookup = $1", [emailLookup(user.email)]);
  if (existing.rows[0]) {
    console.log(`skip existing user ${user.email}`);
    return existing.rows[0].id;
  }

  const inserted = await pool.query<{ id: string }>(
    `insert into users (
       email_lookup, email_ciphertext, password_hash, public_name, public_bio,
       is_founder, is_seeker, availability,
       location_city, location_region, location_country, location_precision, location_consent_at,
       linkedin_url, facebook_url, portfolio_url, contribution_count, success_rate, eligibility
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'city', now(), $12, $13, $14, $15, $16, $17)
     returning id`,
    [
      emailLookup(user.email),
      user.email,
      hashPassword(PASSWORD),
      user.publicName,
      user.publicBio,
      user.isFounder,
      user.isSeeker,
      user.availability,
      user.city,
      user.region,
      "বাংলাদেশ",
      user.linkedinUrl ?? null,
      user.facebookUrl ?? null,
      user.portfolioUrl ?? null,
      user.contributionCount ?? 0,
      user.successRate ?? null,
      user.eligibility ? normalizeBengaliText(user.eligibility) : ""
    ]
  );
  const userId = inserted.rows[0].id;

  const fieldRow = await pool.query<{ id: string }>("select id from field_taxonomy where label_bn = $1", [
    normalizeBengaliText(user.field)
  ]);
  if (fieldRow.rows[0]) {
    await pool.query("insert into user_fields (user_id, field_id) values ($1, $2)", [userId, fieldRow.rows[0].id]);
  } else {
    console.warn(`  WARNING: field taxonomy not matched for "${user.field}"`);
  }

  for (const skill of user.skills) {
    const normalized = normalizeBengaliText(skill);
    const skillRow = await pool.query<{ id: string }>("select id from skill_taxonomy where label_bn = $1", [normalized]);
    if (skillRow.rows[0]) {
      await pool.query("insert into user_skills (user_id, skill_id) values ($1, $2)", [userId, skillRow.rows[0].id]);
    } else {
      console.warn(`  WARNING: skill taxonomy not matched for "${skill}"`);
    }
  }

  for (const label of user.customSkills) {
    const normalized = normalizeBengaliText(label);
    await pool.query("insert into user_custom_skills (user_id, label, normalized_label) values ($1, $2, $3)", [
      userId,
      normalized,
      normalized.toLowerCase()
    ]);
  }

  console.log(`created user ${user.email} (${userId})`);
  return userId;
}

async function insertThesis(thesis: DemoThesis, founderId: string) {
  const session = await pool.query<{ id: string }>(
    "insert into consultant_sessions (user_id, mode, status) values ($1, 'validation', 'confirmed') returning id",
    [founderId]
  );
  const sessionId = session.rows[0].id;

  const raw = JSON.stringify(thesis.parsedData);
  await pool.query(
    `insert into theses (session_id, user_id, version, status, parsed_data, raw_model_output, confirmed_at)
     values ($1, $2, 1, 'confirmed', $3, $4, now())`,
    [sessionId, founderId, raw, raw]
  );

  console.log(`created confirmed thesis for founder ${founderId}: ${thesis.parsedData.idea_summary.solution}`);
}

async function main() {
  const founderIds = new Map<string, string>();

  for (const user of demoUsers) {
    const id = await upsertUser(user);
    founderIds.set(user.email, id);
  }

  for (const thesis of demoTheses) {
    const founderId = founderIds.get(thesis.founderEmail);
    if (!founderId) continue;

    const already = await pool.query(
      `select 1 from theses where user_id = $1 and parsed_data->'idea_summary'->>'solution' = $2`,
      [founderId, thesis.parsedData.idea_summary.solution]
    );
    if (already.rowCount) {
      console.log(`skip existing thesis: ${thesis.parsedData.idea_summary.solution}`);
      continue;
    }

    await insertThesis(thesis, founderId);
  }

  await pool.end();
  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
