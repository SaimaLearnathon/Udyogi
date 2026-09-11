import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Sprout } from "lucide-react";
import { login } from "../api/auth";
import { ApiError } from "../api/client";
import { Card } from "../components/ui/Card";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";

const highlights = [
  "AI কনসালট্যান্টের সাথে ধারণা যাচাই করুন",
  "থিসিস ওয়ার্কস্পেসে পরিকল্পনা ভার্সন রাখুন",
  "স্বচ্ছ স্কোর দিয়ে সঠিক টিমমেট খুঁজুন",
  "কাছাকাছি উদ্যোক্তা ও ফান্ডিং সহায়তা খুঁজে নিন"
];

export function LoginPage() {
  usePageTitle("লগইন");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { setSession } = useAuth();
  const { goTo } = useNavigation();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { token, user } = await login(email, password);
      setSession(token, user);
      goTo("onboarding");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "লগইন সম্পন্ন করা যায়নি, আবার চেষ্টা করুন");
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="mb-1 text-xl font-bold">লগইন করুন</h1>
            <p className="mb-6 text-sm text-base-content/55">আপনার অ্যাকাউন্টে ফিরে যান</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error mb-4 text-sm">
                {error}
              </motion.div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="input input-bordered flex w-full items-center gap-2">
                <Mail size={16} className="text-base-content/40" />
                <input type="email" className="grow" placeholder="ইমেইল" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <label className="input input-bordered flex w-full items-center gap-2">
                <Lock size={16} className="text-base-content/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="grow"
                  placeholder="পাসওয়ার্ড"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-base-content/40 hover:text-base-content">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                লগইন করুন
              </motion.button>
            </form>

            <p className="mt-5 text-center text-sm text-base-content/55">
              নতুন এখানে?{" "}
              <button type="button" onClick={() => goTo("register")} className="font-semibold text-primary hover:underline">
                অ্যাকাউন্ট তৈরি করুন
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
