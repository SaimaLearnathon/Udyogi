import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Compass, MapPin, Save, Sparkles, UserRound } from "lucide-react";
import { availabilityOptions, fieldOptions, precisionOptions, skillOptions } from "../config/profile";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import type { Availability, LocationPrecision } from "../types/profile";

function SectionCard({
  icon: Icon,
  title,
  description,
  children
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-primary/10 text-primary">
          <Icon size={17} />
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-base-content/55">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

export function ProfilePage() {
  usePageTitle("প্রোফাইল");

  const [isFounder, setIsFounder] = useState(true);
  const [isSeeker, setIsSeeker] = useState(true);
  const [availability, setAvailability] = useState<Availability>("full_time");
  const [precision, setPrecision] = useState<LocationPrecision>("city");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([skillOptions[0]]);

  function toggleSkill(skill: string) {
    setSelectedSkills((current) => (current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]));
  }

  return (
    <section>
      <PageHeader
        icon={UserRound}
        title="প্রোফাইল"
        subtitle="প্রতিষ্ঠাতা বা টিমমেট হিসেবে দক্ষতা, আগ্রহ ও লোকেশন প্রেফারেন্স রাখুন।"
        action={
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} type="button" className="btn btn-primary btn-sm gap-1.5">
            <Save size={15} />
            সংরক্ষণ করুন
          </motion.button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={UserRound} title="পরিচিতি" description="আপনার পাবলিক প্রোফাইলে যা দেখা যাবে">
          <div className="space-y-3">
            <input className="input input-bordered w-full" placeholder="পাবলিক নাম" />
            <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="সংক্ষিপ্ত পরিচিতি" />
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { key: "founder", label: "প্রতিষ্ঠাতা", value: isFounder, set: setIsFounder },
                { key: "seeker", label: "টিমমেট খুঁজছি", value: isSeeker, set: setIsSeeker }
              ].map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => role.set((prev) => !prev)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    role.value ? "border-primary bg-primary text-primary-content" : "border-base-300 text-base-content/60"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Briefcase} title="ক্ষেত্র ও প্রাপ্যতা" description="আপনি কোন ধরনের কাজে সময় দিতে চান">
          <div className="space-y-3">
            <select className="select select-bordered w-full" defaultValue="">
              <option value="" disabled>
                ক্ষেত্র নির্বাচন করুন
              </option>
              {fieldOptions.map((field) => (
                <option key={field}>{field}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => {
                const active = availability === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvailability(option.value)}
                    className={`relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active ? "border-transparent text-primary-content" : "border-base-300 text-base-content/60"
                    }`}
                  >
                    {active && (
                      <motion.span layoutId="availability-active" className="absolute inset-0 -z-10 rounded-full bg-primary" />
                    )}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={MapPin} title="লোকেশন প্রাইভেসি" description="ম্যাচিংয়ে আপনার লোকেশন কতটা নির্দিষ্ট দেখাবে">
          <div className="flex flex-wrap gap-2">
            {precisionOptions.map((option) => {
              const active = precision === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrecision(option.value)}
                  className={`relative rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active ? "border-transparent text-primary-content" : "border-base-300 text-base-content/60"
                  }`}
                >
                  {active && <motion.span layoutId="precision-active" className="absolute inset-0 -z-10 rounded-full bg-primary" />}
                  {option.label}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard icon={Sparkles} title="দক্ষতা" description="যেসব বিষয়ে আপনি অবদান রাখতে পারবেন">
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <motion.button
                  key={skill}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => toggleSkill(skill)}
                  className={`badge badge-lg cursor-pointer transition-colors ${
                    active ? "badge-primary" : "badge-outline text-base-content/60"
                  }`}
                >
                  {skill}
                </motion.button>
              );
            })}
          </div>
        </SectionCard>
      </div>

      <Card className="mt-4 flex items-center gap-2.5 p-4 text-sm text-base-content/60">
        <Compass size={16} className="shrink-0 text-primary" />
        সম্পূর্ণ প্রোফাইল ম্যাচিং স্কোরের নির্ভুলতা বাড়ায় এবং উপযুক্ত টিমমেট খুঁজে পেতে সাহায্য করে।
      </Card>
    </section>
  );
}
