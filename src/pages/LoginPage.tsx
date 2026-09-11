import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, Sprout } from "lucide-react";
import { Card } from "../components/ui/Card";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import type { PublicUser } from "../types/profile";

const tabs = [
  { id: "login", label: "লগইন" },
  { id: "register", label: "রেজিস্ট্রেশন" }
] as const;

const highlights = [
  "AI কনসালট্যান্টের সাথে ধারণা যাচাই করুন",
  "থিসিস ওয়ার্কস্পেসে পরিকল্পনা ভার্সন রাখুন",
  "স্বচ্ছ স্কোর দিয়ে সঠিক টিমমেট খুঁজুন",
  "কাছাকাছি উদ্যোক্তা ও ফান্ডিং সহায়তা খুঁজে নিন"
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

export function LoginPage() {
  usePageTitle("লগইন");
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("login");
  const [showPassword, setShowPassword] = useState(false);
  const { setSession } = useAuth();
  const { goTo } = useNavigation();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSession("demo-session-token", demoUser);
    goTo("onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => goTo("landing")}
          className="flex items-center gap-2 text-sm font-medium text-base-content/70 hover:text-base-content"
        >
          <ArrowLeft size={16} />
          ফিরে যান
        </button>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-10">
        <Card className="grid w-full max-w-4xl overflow-hidden md:grid-cols-2">
          <div className="relative hidden flex-col justify-between bg-primary p-8 text-primary-content md:flex">
            <div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-content/15">
                <Sprout size={20} />
              </span>
              <p className="mt-6 text-xl font-bold leading-snug">
                বাংলাদেশি প্রতিষ্ঠাতাদের জন্য একটি ব্যবহারিক কর্মক্ষেত্র
              </p>
            </div>
            <ul className="space-y-3">
              {highlights.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm text-primary-content/85">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 sm:p-8">
            <div className="relative mb-6 grid grid-cols-2 rounded-field bg-base-200 p-1">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`relative z-10 rounded-field py-2 text-sm font-semibold transition-colors ${
                    tab === item.id ? "text-primary-content" : "text-base-content/60"
                  }`}
                >
                  {tab === item.id && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 -z-10 rounded-field bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  {item.label}
                </button>
              ))}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {tab === "register" && (
                <label className="input input-bordered flex w-full items-center gap-2">
                  <Sprout size={16} className="text-base-content/40" />
                  <input type="text" className="grow" placeholder="পাবলিক নাম" />
                </label>
              )}
              <label className="input input-bordered flex w-full items-center gap-2">
                <Mail size={16} className="text-base-content/40" />
                <input type="email" className="grow" placeholder="ইমেইল" />
              </label>
              <label className="input input-bordered flex w-full items-center gap-2">
                <Lock size={16} className="text-base-content/40" />
                <input type={showPassword ? "text" : "password"} className="grow" placeholder="পাসওয়ার্ড" />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-base-content/40 hover:text-base-content">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary w-full">
                {tab === "login" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
              </motion.button>
              <p className="text-center text-xs text-base-content/45">ডেমো টেমপ্লেট — যেকোনো তথ্য দিয়ে চালিয়ে যান</p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
