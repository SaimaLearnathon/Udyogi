import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Briefcase, Compass, GraduationCap, Loader2, MapPin, Save, Sparkles, UserRound, X } from "lucide-react";
import { updateProfile } from "../api/profile";
import { ApiError } from "../api/client";
import { availabilityOptions, fieldOptions, precisionOptions } from "../config/profile";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { CurrentProjectsCard } from "../components/profile/CurrentProjectsCard";
import { useAuth } from "../context/AuthContext";
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
  const { user, token, setSession } = useAuth();

  const [publicName, setPublicName] = useState(user?.publicName ?? "");
  const [publicBio, setPublicBio] = useState(user?.publicBio ?? "");
  const [isFounder, setIsFounder] = useState(user?.isFounder ?? true);
  const [isSeeker, setIsSeeker] = useState(user?.isSeeker ?? true);
  const [field, setField] = useState(user?.field ?? "");
  const [availability, setAvailability] = useState<Availability>(user?.availability ?? "full_time");
  const [city, setCity] = useState(user?.location?.city ?? "");
  const [region, setRegion] = useState(user?.location?.region ?? "");
  const [country, setCountry] = useState(user?.location?.country ?? "বাংলাদেশ");
  const [precision, setPrecision] = useState<LocationPrecision>("city");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user?.skills ?? []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user?.interests ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.socials?.linkedinUrl ?? "");
  const [facebookUrl, setFacebookUrl] = useState(user?.socials?.facebookUrl ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(user?.socials?.portfolioUrl ?? "");
  const [contributionCount, setContributionCount] = useState(user?.contributionCount ?? 0);
  const [successRate, setSuccessRate] = useState<number | "">(user?.successRate ?? "");
  const [eligibility, setEligibility] = useState(user?.eligibility ?? "");

  useEffect(() => {
    if (!user) return;
    setPublicName(user.publicName);
    setPublicBio(user.publicBio);
    setIsFounder(user.isFounder);
    setIsSeeker(user.isSeeker);
    setField(user.field ?? "");
    setAvailability(user.availability);
    setCity(user.location?.city ?? "");
    setRegion(user.location?.region ?? "");
    setCountry(user.location?.country ?? "বাংলাদেশ");
    setSelectedSkills(user.skills ?? []);
    setSelectedInterests(user.interests ?? []);
    setLinkedinUrl(user.socials?.linkedinUrl ?? "");
    setFacebookUrl(user.socials?.facebookUrl ?? "");
    setPortfolioUrl(user.socials?.portfolioUrl ?? "");
    setContributionCount(user.contributionCount ?? 0);
    setSuccessRate(user.successRate ?? "");
    setEligibility(user.eligibility ?? "");
  }, [user]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function addSkill(rawValue: string) {
    const value = rawValue.trim();
    if (!value) return;
    setSelectedSkills((current) => (current.includes(value) ? current : [...current, value]));
  }

  function addInterest(rawValue: string) {
    const value = rawValue.trim();
    if (!value) return;
    setSelectedInterests((current) => (current.includes(value) ? current : [...current, value]));
  }

  async function handleSave() {
    if (!token) {
      setSaveError("সংরক্ষণ করতে প্রথমে লগইন করুন");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const updated = await updateProfile(token, {
        publicName: publicName.trim(),
        publicBio: publicBio.trim(),
        isFounder,
        isSeeker,
        availability,
        location: { city: city.trim(), region: region.trim(), country: country.trim() },
        field,
        precision,
        skills: selectedSkills,
        interests: selectedInterests.join(", "),
        linkedinUrl: linkedinUrl.trim() || null,
        facebookUrl: facebookUrl.trim() || null,
        portfolioUrl: portfolioUrl.trim() || null,
        contributionCount,
        successRate: successRate === "" ? null : successRate,
        eligibility: eligibility.trim()
      });
      setSession(token, updated);
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof ApiError ? error.message : "প্রোফাইল সংরক্ষণ করা যায়নি");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageHeader
        icon={UserRound}
        title="প্রোফাইল"
        subtitle="প্রতিষ্ঠাতা বা টিমমেট হিসেবে দক্ষতা, আগ্রহ ও লোকেশন প্রেফারেন্স রাখুন।"
        action={
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary btn-sm gap-1.5"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            সংরক্ষণ করুন
          </motion.button>
        }
      />

      {saveError && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error mb-4 text-sm">
          {saveError}
        </motion.div>
      )}
      {saved && !saveError && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert alert-success mb-4 text-sm">
          প্রোফাইল সংরক্ষণ হয়েছে
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard icon={UserRound} title="পরিচিতি" description="আপনার পাবলিক প্রোফাইলে যা দেখা যাবে">
          <div className="space-y-3">
            <input
              className="input input-bordered w-full"
              placeholder="পাবলিক নাম"
              value={publicName}
              onChange={(event) => setPublicName(event.target.value)}
            />
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="সংক্ষিপ্ত পরিচিতি"
              value={publicBio}
              onChange={(event) => setPublicBio(event.target.value)}
            />
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
            <select className="select select-bordered w-full" value={field} onChange={(event) => setField(event.target.value)}>
              <option value="" disabled>
                ক্ষেত্র নির্বাচন করুন
              </option>
              {fieldOptions.map((option) => (
                <option key={option}>{option}</option>
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
                      <motion.span layoutId="availability-active" className="absolute inset-0 rounded-full bg-primary" />
                    )}
                    <span className="relative">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={MapPin} title="লোকেশন প্রাইভেসি" description="ম্যাচিংয়ে আপনার লোকেশন কতটা নির্দিষ্ট দেখাবে">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              <input className="input input-bordered w-full" placeholder="শহর" value={city} onChange={(event) => setCity(event.target.value)} />
              <input className="input input-bordered w-full" placeholder="বিভাগ" value={region} onChange={(event) => setRegion(event.target.value)} />
              <input className="input input-bordered w-full" placeholder="দেশ" value={country} onChange={(event) => setCountry(event.target.value)} />
            </div>
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
                    {active && <motion.span layoutId="precision-active" className="absolute inset-0 rounded-full bg-primary" />}
                    <span className="relative">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Sparkles} title="দক্ষতা ও আগ্রহ" description="যেসব বিষয়ে আপনি অবদান রাখতে পারবেন">
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-base-content/60">দক্ষতা</p>
              <input
                className="input input-bordered w-full"
                placeholder="একটি দক্ষতা লিখে Enter চাপুন"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addSkill(skillInput);
                    setSkillInput("");
                  }
                }}
              />
              {selectedSkills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSkills.map((skill) => (
                    <span key={skill} className="badge badge-lg badge-primary gap-1.5">
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSelectedSkills((current) => current.filter((item) => item !== skill))}
                        aria-label={`${skill} সরান`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-base-content/60">আগ্রহ</p>
              <input
                className="input input-bordered w-full"
                placeholder="একটি আগ্রহের বিষয় লিখে Enter চাপুন"
                value={interestInput}
                onChange={(event) => setInterestInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === ",") {
                    event.preventDefault();
                    addInterest(interestInput);
                    setInterestInput("");
                  }
                }}
              />
              {selectedInterests.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <span key={interest} className="badge badge-lg badge-secondary gap-1.5">
                      {interest}
                      <button
                        type="button"
                        onClick={() => setSelectedInterests((current) => current.filter((item) => item !== interest))}
                        aria-label={`${interest} সরান`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard icon={Award} title="অতিরিক্ত তথ্য" description="সোশ্যাল লিংক, অভিজ্ঞতা ও ট্র্যাক রেকর্ড (ঐচ্ছিক)">
          <div className="space-y-3">
            <input
              className="input input-bordered w-full"
              placeholder="LinkedIn লিংক"
              value={linkedinUrl}
              onChange={(event) => setLinkedinUrl(event.target.value)}
            />
            <input
              className="input input-bordered w-full"
              placeholder="Facebook লিংক"
              value={facebookUrl}
              onChange={(event) => setFacebookUrl(event.target.value)}
            />
            <input
              className="input input-bordered w-full"
              placeholder="পোর্টফোলিও / ওয়েবসাইট লিংক"
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="form-control">
                <span className="mb-1 text-xs text-base-content/55">অবদানের সংখ্যা</span>
                <input
                  type="number"
                  min={0}
                  className="input input-bordered w-full"
                  value={contributionCount}
                  onChange={(event) => setContributionCount(Math.max(0, Number(event.target.value) || 0))}
                />
              </label>
              <label className="form-control">
                <span className="mb-1 text-xs text-base-content/55">সাফল্যের হার (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input input-bordered w-full"
                  placeholder="—"
                  value={successRate}
                  onChange={(event) => {
                    const raw = event.target.value;
                    setSuccessRate(raw === "" ? "" : Math.min(100, Math.max(0, Number(raw))));
                  }}
                />
              </label>
            </div>
            <label className="form-control">
              <span className="mb-1 flex items-center gap-1 text-xs text-base-content/55">
                <GraduationCap size={12} /> যোগ্যতা / অভিজ্ঞতা
              </span>
              <input
                className="input input-bordered w-full"
                placeholder="যেমন: কম্পিউটার সায়েন্স স্নাতক, ৩ বছরের অভিজ্ঞতা"
                value={eligibility}
                onChange={(event) => setEligibility(event.target.value)}
              />
            </label>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4">
        <CurrentProjectsCard projects={user?.currentProjects ?? []} emptyMessage="এখনো কোনো প্রজেক্টে যুক্ত হননি।" />
      </div>

      <Card className="mt-4 flex items-center gap-2.5 p-4 text-sm text-base-content/60">
        <Compass size={16} className="shrink-0 text-primary" />
        সম্পূর্ণ প্রোফাইল ম্যাচিং স্কোরের নির্ভুলতা বাড়ায় এবং উপযুক্ত টিমমেট খুঁজে পেতে সাহায্য করে।
      </Card>
    </section>
  );
}
