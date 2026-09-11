import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  Sprout,
  UserRound,
  X
} from "lucide-react";
import { register } from "../api/auth";
import { ApiError } from "../api/client";
import { Card } from "../components/ui/Card";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { availabilityOptions, fieldOptions, precisionOptions } from "../config/profile";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Availability, LocationPrecision } from "../types/profile";

interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  publicName: string;
  publicBio: string;
  isFounder: boolean;
  isSeeker: boolean;
  field: string;
  availability: Availability;
  city: string;
  region: string;
  country: string;
  precision: LocationPrecision;
  skills: string[];
  interests: string[];
}

const initialState: FormState = {
  email: "",
  password: "",
  confirmPassword: "",
  publicName: "",
  publicBio: "",
  isFounder: false,
  isSeeker: false,
  field: "",
  availability: "full_time",
  city: "",
  region: "",
  country: "বাংলাদেশ",
  precision: "city",
  skills: [],
  interests: []
};

const steps = [
  { id: "account", label: "অ্যাকাউন্ট" },
  { id: "identity", label: "পরিচিতি" },
  { id: "field", label: "ক্ষেত্র" },
  { id: "location", label: "লোকেশন" },
  { id: "skills", label: "দক্ষতা" }
] as const;

function stepErrors(step: number, form: FormState): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push("সঠিক ইমেইল দিন");
    if (form.password.length < 8) errors.push("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে");
    if (form.password !== form.confirmPassword) errors.push("দুটি পাসওয়ার্ড মিলছে না");
  }
  if (step === 1) {
    if (!form.publicName.trim()) errors.push("পাবলিক নাম আবশ্যক");
    if (!form.isFounder && !form.isSeeker) errors.push("অন্তত একটি ভূমিকা নির্বাচন করুন");
  }
  if (step === 2) {
    if (!form.field) errors.push("ক্ষেত্র নির্বাচন করুন");
  }
  return errors;
}

export function RegisterPage() {
  usePageTitle("রেজিস্ট্রেশন");
  const { setSession } = useAuth();
  const { goTo } = useNavigation();

  const [form, setForm] = useState<FormState>(initialState);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const isLastStep = step === steps.length - 1;
  const currentErrors = stepErrors(step, form);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addTag(key: "skills" | "interests", rawValue: string) {
    const value = rawValue.trim();
    if (!value || form[key].includes(value)) return;
    update(key, [...form[key], value]);
  }

  function removeTag(key: "skills" | "interests", value: string) {
    update(
      key,
      form[key].filter((item) => item !== value)
    );
  }

  function goToStep(next: number) {
    if (next < 0 || next >= steps.length) return;
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setTouched(false);
    setSubmitError(null);
  }

  function handleNext() {
    if (currentErrors.length) {
      setTouched(true);
      return;
    }
    goToStep(step + 1);
  }

  async function handleSubmit() {
    if (currentErrors.length) {
      setTouched(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { token, user } = await register({
        email: form.email,
        password: form.password,
        publicName: form.publicName.trim(),
        publicBio: form.publicBio.trim(),
        isFounder: form.isFounder,
        isSeeker: form.isSeeker,
        availability: form.availability,
        location: { city: form.city.trim(), region: form.region.trim(), country: form.country.trim() },
        field: form.field,
        precision: form.precision,
        skills: form.skills,
        interests: form.interests.join(", ")
      });
      setSession(token, user);
      goTo("onboarding");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSubmitError(error.message);
        goToStep(0);
      } else if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("রেজিস্ট্রেশন সম্পন্ন করা যায়নি, আবার চেষ্টা করুন");
      }
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

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-12">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
            <Sprout size={18} />
          </span>
          <div>
            <p className="text-lg font-bold leading-tight">অ্যাকাউন্ট তৈরি করুন</p>
            <p className="text-xs text-base-content/55">প্রোফাইলের তথ্যসহ একবারে সেটআপ সম্পন্ন করুন</p>
          </div>
        </div>

        <ul className="steps steps-horizontal mb-8 w-full text-xs">
          {steps.map((item, index) => (
            <li
              key={item.id}
              className={`step cursor-pointer ${index <= step ? "step-primary" : ""}`}
              onClick={() => index < step && goToStep(index)}
            >
              {item.label}
            </li>
          ))}
        </ul>

        {submitError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error mb-4 text-sm">
            {submitError}
          </motion.div>
        )}

        <Card className="overflow-hidden p-6 sm:p-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-semibold">লগইন তথ্য</h2>
                  <label className="input input-bordered flex w-full items-center gap-2">
                    <Mail size={16} className="text-base-content/40" />
                    <input
                      type="email"
                      className="grow"
                      placeholder="ইমেইল"
                      value={form.email}
                      onChange={(event) => update("email", event.target.value)}
                    />
                  </label>
                  <label className="input input-bordered flex w-full items-center gap-2">
                    <Lock size={16} className="text-base-content/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="grow"
                      placeholder="পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
                      value={form.password}
                      onChange={(event) => update("password", event.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-base-content/40 hover:text-base-content">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </label>
                  <label className="input input-bordered flex w-full items-center gap-2">
                    <Lock size={16} className="text-base-content/40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="grow"
                      placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                      value={form.confirmPassword}
                      onChange={(event) => update("confirmPassword", event.target.value)}
                    />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <UserRound size={16} className="text-primary" /> পরিচিতি
                  </h2>
                  <input
                    className="input input-bordered w-full"
                    placeholder="পাবলিক নাম"
                    value={form.publicName}
                    onChange={(event) => update("publicName", event.target.value)}
                  />
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="সংক্ষিপ্ত পরিচিতি"
                    value={form.publicBio}
                    onChange={(event) => update("publicBio", event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "founder" as const, label: "প্রতিষ্ঠাতা", value: form.isFounder },
                      { key: "seeker" as const, label: "টিমমেট খুঁজছি", value: form.isSeeker }
                    ].map((role) => (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => update(role.key === "founder" ? "isFounder" : "isSeeker", !role.value)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          role.value ? "border-primary bg-primary text-primary-content" : "border-base-300 text-base-content/60"
                        }`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <Briefcase size={16} className="text-primary" /> ক্ষেত্র ও প্রাপ্যতা
                  </h2>
                  <select
                    className="select select-bordered w-full"
                    value={form.field}
                    onChange={(event) => update("field", event.target.value)}
                  >
                    <option value="" disabled>
                      ক্ষেত্র নির্বাচন করুন
                    </option>
                    {fieldOptions.map((field) => (
                      <option key={field}>{field}</option>
                    ))}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    {availabilityOptions.map((option) => {
                      const active = form.availability === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => update("availability", option.value)}
                          className={`relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                            active ? "border-transparent text-primary-content" : "border-base-300 text-base-content/60"
                          }`}
                        >
                          {active && (
                            <motion.span layoutId="register-availability" className="absolute inset-0 rounded-full bg-primary" />
                          )}
                          <span className="relative">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <MapPin size={16} className="text-primary" /> লোকেশন প্রাইভেসি
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="input input-bordered w-full"
                      placeholder="শহর"
                      value={form.city}
                      onChange={(event) => update("city", event.target.value)}
                    />
                    <input
                      className="input input-bordered w-full"
                      placeholder="বিভাগ"
                      value={form.region}
                      onChange={(event) => update("region", event.target.value)}
                    />
                    <input
                      className="input input-bordered w-full"
                      placeholder="দেশ"
                      value={form.country}
                      onChange={(event) => update("country", event.target.value)}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs text-base-content/55">ম্যাচিংয়ে আপনার লোকেশন কতটা নির্দিষ্ট দেখাবে</p>
                    <div className="flex flex-wrap gap-2">
                      {precisionOptions.map((option) => {
                        const active = form.precision === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => update("precision", option.value)}
                            className={`relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                              active ? "border-transparent text-primary-content" : "border-base-300 text-base-content/60"
                            }`}
                          >
                            {active && (
                              <motion.span layoutId="register-precision" className="absolute inset-0 rounded-full bg-primary" />
                            )}
                            <span className="relative">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="mb-2 flex items-center gap-2 font-semibold">
                      <Sparkles size={16} className="text-primary" /> দক্ষতা
                    </h2>
                    <input
                      className="input input-bordered w-full"
                      placeholder="একটি দক্ষতা লিখে Enter চাপুন"
                      value={skillInput}
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault();
                          addTag("skills", skillInput);
                          setSkillInput("");
                        }
                      }}
                    />
                    {form.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.skills.map((skill) => (
                          <span key={skill} className="badge badge-lg badge-primary gap-1.5">
                            {skill}
                            <button type="button" onClick={() => removeTag("skills", skill)} aria-label={`${skill} সরান`}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="mb-2 font-semibold">আগ্রহ</h2>
                    <input
                      className="input input-bordered w-full"
                      placeholder="একটি আগ্রহের বিষয় লিখে Enter চাপুন"
                      value={interestInput}
                      onChange={(event) => setInterestInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === ",") {
                          event.preventDefault();
                          addTag("interests", interestInput);
                          setInterestInput("");
                        }
                      }}
                    />
                    {form.interests.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form.interests.map((interest) => (
                          <span key={interest} className="badge badge-lg badge-secondary gap-1.5">
                            {interest}
                            <button type="button" onClick={() => removeTag("interests", interest)} aria-label={`${interest} সরান`}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {touched && currentErrors.length > 0 && (
                <ul className="mt-4 space-y-1 text-xs text-error">
                  {currentErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between border-t border-base-300 pt-5">
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              disabled={step === 0}
              className="btn btn-ghost btn-sm gap-1.5 disabled:opacity-0"
            >
              <ArrowLeft size={15} />
              পেছনে
            </button>

            {isLastStep ? (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary btn-sm gap-1.5"
              >
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Sprout size={15} />}
                অ্যাকাউন্ট তৈরি করুন
              </motion.button>
            ) : (
              <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }} type="button" onClick={handleNext} className="btn btn-primary btn-sm gap-1.5">
                পরবর্তী
                <ArrowRight size={15} />
              </motion.button>
            )}
          </div>
        </Card>

        <p className="mt-5 text-center text-sm text-base-content/55">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <button type="button" onClick={() => goTo("login")} className="font-semibold text-primary hover:underline">
            লগইন করুন
          </button>
        </p>
      </div>
    </div>
  );
}
