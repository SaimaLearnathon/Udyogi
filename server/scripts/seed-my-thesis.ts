import { pool } from "../src/db/pool.js";

const OWNER_EMAIL = "saimafarhanaislam@gmail.com";

interface DemoThesis {
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

const theses: DemoThesis[] = [
  {
    parsedData: {
      idea_summary: {
        problem: "বিশ্ববিদ্যালয় শিক্ষার্থীদের মানসিক স্বাস্থ্য সহায়তা প্রয়োজন হলেও কাউন্সেলিং সেবা সহজলভ্য বা সাশ্রয়ী নয়।",
        solution: "শিক্ষার্থীদের জন্য সাশ্রয়ী অনলাইন কাউন্সেলিং ও মানসিক সুস্থতা ট্র্যাকিং অ্যাপ, যেখানে লাইসেন্সপ্রাপ্ত কাউন্সেলরদের সাথে ভিডিও/চ্যাট সেশন বুক করা যাবে।",
        target_customer: "বাংলাদেশের বিশ্ববিদ্যালয় ও কলেজ শিক্ষার্থীরা।",
        value_proposition: "শিক্ষার্থীদের জন্য সাশ্রয়ী মানসিক স্বাস্থ্য সহায়তা প্ল্যাটফর্ম"
      },
      feasibility_assessment: {
        rating: "Medium",
        rationale: "চাহিদা স্পষ্ট এবং প্রতিষ্ঠাতার হেলথটেক ক্ষেত্রে আগ্রহ আছে, তবে লাইসেন্সপ্রাপ্ত কাউন্সেলর নেটওয়ার্ক গড়ে তোলা সময়সাপেক্ষ।"
      },
      market_analysis: {
        market_description: "বাংলাদেশে শিক্ষার্থীদের মানসিক স্বাস্থ্য নিয়ে সচেতনতা বাড়ছে কিন্তু সেবা সীমিত।",
        target_segment: "ঢাকা ও চট্টগ্রামের বিশ্ববিদ্যালয় শিক্ষার্থী।",
        competitors: ["Moner Bondhu", "Kaan Pete Roi"],
        differentiation: "সাশ্রয়ী শিক্ষার্থী-বিশেষ প্যাকেজ ও বিশ্ববিদ্যালয়ের সাথে সরাসরি অংশীদারিত্ব।"
      },
      licensing_notes:
        "মানসিক স্বাস্থ্য সেবা প্রদানকারী কাউন্সেলরদের যথাযথ লাইসেন্স যাচাই ও স্বাস্থ্য অধিদপ্তরের নিয়ন্ত্রক প্রয়োজনীয়তা মানতে হবে। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি পরামর্শ নয়।",
      mvp_roadmap: [
        { phase: "ধাপ ১", description: "৩ জন লাইসেন্সপ্রাপ্ত কাউন্সেলর নিয়ে একটি বিশ্ববিদ্যালয়ে পাইলট।", estimated_timeframe: "২ মাস" },
        { phase: "ধাপ ২", description: "মুড ট্র্যাকিং ও রিমাইন্ডার ফিচার যুক্ত করা।", estimated_timeframe: "২ মাস" },
        { phase: "ধাপ ৩", description: "৫টি বিশ্ববিদ্যালয়ে সম্প্রসারণ।", estimated_timeframe: "৫ মাস" }
      ],
      financial_evaluation: {
        estimated_cost_categories: ["অ্যাপ ডেভেলপমেন্ট", "কাউন্সেলর সম্মানী", "মার্কেটিং"],
        revenue_model: "প্রতি সেশনে সাশ্রয়ী ফি এবং বিশ্ববিদ্যালয়ের সাথে সাবস্ক্রিপশন চুক্তি।",
        runway_notes: "প্রাথমিক পুঁজিতে প্রায় ৮-১০ মাস চালানো সম্ভব। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আর্থিক পরামর্শ নয়।"
      },
      required_resources: ["প্রাথমিক পুঁজি", "লাইসেন্সপ্রাপ্ত কাউন্সেলর নেটওয়ার্ক", "বিশ্ববিদ্যালয় অংশীদারিত্ব"],
      required_skillsets: [
        { skill_tag: "মোবাইল অ্যাপ ডেভেলপার", description: "ভিডিও/চ্যাট সেশন ও বুকিং ফিচার তৈরি করবেন।", priority: "High" },
        { skill_tag: "ক্লিনিক্যাল সাইকোলজিস্ট", description: "কাউন্সেলিং মান ও নীতিমালা তদারকি করবেন।", priority: "High" },
        { skill_tag: "UI/UX ডিজাইনার", description: "নিরাপদ ও আরামদায়ক ব্যবহারকারী অভিজ্ঞতা ডিজাইন করবেন।", priority: "Medium" },
        { skill_tag: "মার্কেটিং এক্সিকিউটিভ", description: "বিশ্ববিদ্যালয়ে সচেতনতা ও ব্যবহারকারী সংগ্রহ করবেন।", priority: "Medium" },
        { skill_tag: "কমপ্লায়েন্স অফিসার", description: "স্বাস্থ্য নিয়ন্ত্রক প্রয়োজনীয়তা নিশ্চিত করবেন।", priority: "Low" }
      ]
    }
  },
  {
    parsedData: {
      idea_summary: {
        problem: "স্কুল শিক্ষার্থীরা বিজ্ঞান ও গণিতের কঠিন বিষয়গুলো বুঝতে হিমশিম খায় এবং ব্যক্তিগত টিউটরের খরচ বেশি।",
        solution: "স্থানীয় ভাষায় ভিডিও পাঠ, প্র্যাকটিস কুইজ ও AI-ভিত্তিক দুর্বলতা চিহ্নিতকরণসহ একটি মাইক্রো-লার্নিং মোবাইল অ্যাপ।",
        target_customer: "বাংলাদেশের মাধ্যমিক বিদ্যালয়ের শিক্ষার্থী ও তাদের অভিভাবক।",
        value_proposition: "শিক্ষার্থীদের জন্য সাশ্রয়ী মাইক্রো-লার্নিং প্ল্যাটফর্ম"
      },
      feasibility_assessment: {
        rating: "High",
        rationale: "বাজারের চাহিদা স্পষ্ট এবং প্রযুক্তিগতভাবে বাস্তবায়নযোগ্য, প্রতিযোগিতা থাকলেও পার্থক্য তৈরি সম্ভব।"
      },
      market_analysis: {
        market_description: "বাংলাদেশে এডটেক বাজার দ্রুত বাড়ছে, বিশেষত স্মার্টফোন ব্যবহারকারী শিক্ষার্থীদের মধ্যে।",
        target_segment: "মাধ্যমিক পর্যায়ের শিক্ষার্থী, বিশেষত মফস্বল ও শহরতলির।",
        competitors: ["Shikho", "10 Minute School"],
        differentiation: "অতি সংক্ষিপ্ত মাইক্রো-লার্নিং মডিউল ও ব্যক্তিগতকৃত দুর্বলতা বিশ্লেষণ।"
      },
      licensing_notes: "শিক্ষা প্রতিষ্ঠানের সাথে কনটেন্ট অংশীদারিত্বে কপিরাইট বিষয়ক চুক্তি প্রয়োজন হতে পারে। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আইনি পরামর্শ নয়।",
      mvp_roadmap: [
        { phase: "ধাপ ১", description: "একটি বিষয়ে (গণিত) ২০টি মাইক্রো-লেসন নিয়ে পাইলট।", estimated_timeframe: "২ মাস" },
        { phase: "ধাপ ২", description: "AI দুর্বলতা বিশ্লেষণ ফিচার যুক্ত করা।", estimated_timeframe: "৩ মাস" },
        { phase: "ধাপ ৩", description: "বিজ্ঞান ও ইংরেজি বিষয় যুক্ত করে সম্প্রসারণ।", estimated_timeframe: "৪ মাস" }
      ],
      financial_evaluation: {
        estimated_cost_categories: ["কনটেন্ট তৈরি", "অ্যাপ ডেভেলপমেন্ট", "মার্কেটিং"],
        revenue_model: "মাসিক সাবস্ক্রিপশন ও ফ্রিমিয়াম মডেল।",
        runway_notes: "প্রাথমিক পুঁজিতে প্রায় ৯-১১ মাস চালানো সম্ভব। এটি শুধুমাত্র তথ্যভিত্তিক নির্দেশনা, পেশাদার আর্থিক পরামর্শ নয়।"
      },
      required_resources: ["প্রাথমিক পুঁজি", "কনটেন্ট নির্মাতা দল", "শিক্ষা প্রতিষ্ঠান অংশীদারিত্ব"],
      required_skillsets: [
        { skill_tag: "মোবাইল অ্যাপ ডেভেলপার", description: "অ্যাপ ও অফলাইন কনটেন্ট সিঙ্ক ফিচার তৈরি করবেন।", priority: "High" },
        { skill_tag: "কারিকুলাম বিশেষজ্ঞ", description: "পাঠ্যক্রম অনুযায়ী মাইক্রো-লেসন ডিজাইন করবেন।", priority: "High" },
        { skill_tag: "ভিডিও এডিটর", description: "সংক্ষিপ্ত ও আকর্ষণীয় পাঠ ভিডিও তৈরি করবেন।", priority: "Medium" },
        { skill_tag: "ডেটা সায়েন্টিস্ট", description: "শিক্ষার্থীর দুর্বলতা বিশ্লেষণের মডেল তৈরি করবেন।", priority: "Medium" },
        { skill_tag: "সেলস এক্সিকিউটিভ", description: "স্কুল ও অভিভাবকদের কাছে প্রচারণা চালাবেন।", priority: "Low" }
      ]
    }
  }
];

async function main() {
  const userResult = await pool.query<{ id: string }>(
    "select id from users where email_ciphertext = $1",
    [OWNER_EMAIL]
  );
  const ownerId = userResult.rows[0]?.id;
  if (!ownerId) {
    console.error(`user not found for email ${OWNER_EMAIL}`);
    process.exit(1);
  }
  console.log(`seeding theses for user ${ownerId}`);

  for (const thesis of theses) {
    const already = await pool.query(
      "select 1 from theses where user_id = $1 and parsed_data->'idea_summary'->>'solution' = $2",
      [ownerId, thesis.parsedData.idea_summary.solution]
    );
    if (already.rowCount) {
      console.log(`skip existing thesis: ${thesis.parsedData.idea_summary.solution}`);
      continue;
    }

    const session = await pool.query<{ id: string }>(
      "insert into consultant_sessions (user_id, mode, status) values ($1, 'validation', 'confirmed') returning id",
      [ownerId]
    );
    const sessionId = session.rows[0].id;

    const raw = JSON.stringify(thesis.parsedData);
    await pool.query(
      `insert into theses (session_id, user_id, version, status, parsed_data, raw_model_output, confirmed_at)
       values ($1, $2, 1, 'confirmed', $3, $4, now())`,
      [sessionId, ownerId, raw, raw]
    );
    console.log(`created confirmed thesis: ${thesis.parsedData.idea_summary.solution}`);
  }

  await pool.end();
  console.log("done");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
