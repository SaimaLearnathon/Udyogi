import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Quote, Sprout } from "lucide-react";
import { LandingNav } from "../components/landing/LandingNav";
import { HeroVisual } from "../components/landing/HeroVisual";
import { NearbyFounders } from "../components/landing/NearbyFounders";
import { SupportDirectory } from "../components/landing/SupportDirectory";
import { FeaturePillars } from "../components/landing/FeaturePillars";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";
import { useDemo } from "../context/DemoContext";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../config/motion";
import type { PublicUser } from "../types/profile";

const stats = [
  { label: "সক্রিয় উদ্যোক্তা", value: 500, suffix: "+" },
  { label: "সহযোগী সংস্থা", value: 80, suffix: "+" },
  { label: "জেলা কভারেজ", value: 32 },
  { label: "গড় ম্যাচ স্কোর", value: 78 }
];

const demoUser: PublicUser = {
  id: "demo-user",
  publicName: "অতিথি প্রতিষ্ঠাতা",
  publicBio: "",
  isFounder: true,
  isSeeker: true,
  availability: "part_time",
  field: "এগ্রিটেক",
  skills: ["প্রোডাক্ট"],
  interests: [],
  location: { city: "ঢাকা", region: "ঢাকা", country: "বাংলাদেশ" }
};

export function LandingPage() {
  usePageTitle("উদ্যোগী");
  const { nearbyFounders, supportOrganizations } = useDemo();
  const { setSession } = useAuth();
  const { goTo } = useNavigation();

  function exploreDemo() {
    setSession("demo-session-token", demoUser);
    goTo("onboarding");
  }

  return (
    <div>
      <LandingNav />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-8 md:grid-cols-2 md:items-center md:py-20">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sprout size={13} />
            বাংলাদেশের জন্য তৈরি AI স্টার্টআপ কনসালট্যান্ট
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            ধারণাকে পরিকল্পনা, <span className="text-primary">পরিকল্পনাকে দল</span> — সবটাই এক জায়গায়
          </h1>
          <p className="mt-5 max-w-lg text-base text-base-content/65 md:text-lg">
            AI কনসালট্যান্টের সাথে আইডিয়া যাচাই করুন, কাছাকাছি উদ্যোক্তাদের সাথে পরিচিত হন, এবং ফান্ডিং ও আইনি
            সহায়তাসহ উপযুক্ত টিমমেট খুঁজুন — সবকিছু বাংলায়।
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => goTo("login")}
              className="btn btn-primary gap-2"
            >
              ফ্রি শুরু করুন
              <ArrowRight size={17} />
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={exploreDemo}
              className="btn btn-ghost gap-2"
            >
              <PlayCircle size={17} />
              ডেমো এক্সপ্লোর করুন
            </motion.button>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={staggerItem}>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-base-content/55">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <HeroVisual />
        </motion.div>
      </section>

      <NearbyFounders founders={nearbyFounders} />
      <SupportDirectory organizations={supportOrganizations} />
      <FeaturePillars />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="relative mx-auto max-w-2xl rounded-box border border-base-300 bg-base-100 p-8 text-center shadow-sm"
        >
          <Quote className="mx-auto mb-3 text-primary/30" size={28} />
          <blockquote className="text-lg font-medium leading-relaxed">
            "কনসালট্যান্টের সাথে দুই সপ্তাহে আমার আইডিয়া থিসিসে রূপ নিয়েছে, আর ম্যাচিং থেকে খুঁজে পেয়েছি আমার
            প্রথম সহ-প্রতিষ্ঠাতাকে।"
          </blockquote>
          <figcaption className="mt-4 text-sm text-base-content/55">— নাফিসা ইসলাম, প্রতিষ্ঠাতা, ফার্ম-টু-রিটেইল</figcaption>
        </motion.figure>
      </section>

      <section className="px-4 pb-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="bg-mesh mx-auto flex max-w-5xl flex-col items-center gap-5 rounded-box border border-base-300 bg-primary/5 p-10 text-center"
        >
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">আপনার ধারণা নিয়ে আজই শুরু করুন</h2>
          <p className="max-w-lg text-base-content/65">
            বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং AI কনসালট্যান্টের সাথে প্রথম কথোপকথন শুরু করুন।
          </p>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => goTo("login")}
            className="btn btn-primary gap-2"
          >
            ফ্রি শুরু করুন
            <ArrowRight size={17} />
          </motion.button>
        </motion.div>
      </section>

      <footer className="border-t border-base-300 bg-base-100">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
                  <Sprout size={16} />
                </span>
                <p className="text-lg font-bold">উদ্যোগী</p>
              </div>
              <p className="mt-2 max-w-xs text-sm text-base-content/55">ধারণা থেকে দল গঠন — বাংলাদেশি প্রতিষ্ঠাতাদের জন্য একটি ব্যবহারিক কর্মক্ষেত্র।</p>
            </div>
            <div className="flex gap-10 text-sm">
              <div>
                <p className="mb-2 font-semibold">প্রোডাক্ট</p>
                <ul className="space-y-1.5 text-base-content/55">
                  <li>কনসালট্যান্ট</li>
                  <li>থিসিস ওয়ার্কস্পেস</li>
                  <li>ম্যাচিং</li>
                </ul>
              </div>
              <div>
                <p className="mb-2 font-semibold">সহায়তা</p>
                <ul className="space-y-1.5 text-base-content/55">
                  <li>ফান্ডিং তালিকা</li>
                  <li>আইনি সহায়তা</li>
                  <li>মেন্টরশিপ</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-base-content/40">© {new Date().getFullYear()} উদ্যোগী। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
