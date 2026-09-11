import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Facebook,
  GraduationCap,
  Linkedin,
  Loader2,
  LogIn,
  MapPin,
  Send,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Globe,
  Star
} from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { getCandidateProfile, sendTeamRequest } from "../api/listings";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import type { PublicCandidateDetail } from "../types/listing";

const availabilityLabel: Record<string, string> = {
  full_time: "পূর্ণকালীন",
  part_time: "আংশিক সময়",
  advisor: "পরামর্শক"
};

function scoreTone(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}

export function CandidateProfilePage() {
  usePageTitle("প্রোফাইল");
  const { token } = useAuth();
  const { params, goTo } = useNavigation();
  const listingId = params.listing;
  const candidateId = params.id;

  const [candidate, setCandidate] = useState<PublicCandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [skillTag, setSkillTag] = useState<string | undefined>(params.skill);

  useEffect(() => {
    if (!token || !listingId || !candidateId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCandidateProfile(token, listingId, candidateId)
      .then((data) => {
        if (!cancelled) setCandidate(data);
      })
      .catch(() => {
        if (!cancelled) setError("প্রোফাইল লোড করা যায়নি");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, listingId, candidateId]);

  async function handleSendRequest() {
    if (!token || !listingId || !candidateId) return;
    setSending(true);
    setError(null);
    try {
      await sendTeamRequest(token, listingId, candidateId, skillTag);
      setCandidate((prev) => (prev ? { ...prev, requestStatus: "pending" } : prev));
    } catch {
      setError("অনুরোধ পাঠানো যায়নি, আবার চেষ্টা করুন");
    } finally {
      setSending(false);
    }
  }

  const backLink = (
    <button
      type="button"
      onClick={() => (listingId ? goTo("matching", { id: listingId }) : goTo("matching"))}
      className="mb-4 flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content"
    >
      <ArrowLeft size={14} />
      লিস্টিংয়ে ফিরে যান
    </button>
  );

  if (!token) {
    return (
      <section>
        <PageHeader title="প্রোফাইল" subtitle="বিস্তারিত দেখতে লগইন করুন।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <button type="button" onClick={() => goTo("login")} className="btn btn-primary btn-sm mt-1">
            লগইন করুন
          </button>
        </Card>
      </section>
    );
  }

  if (loading) {
    return (
      <section>
        {backLink}
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </section>
    );
  }

  if (!candidate) {
    return (
      <section>
        {backLink}
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-base-content/60">{error ?? "প্রোফাইল পাওয়া যায়নি।"}</p>
        </Card>
      </section>
    );
  }

  const socialsList = [
    { url: candidate.socials.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { url: candidate.socials.facebookUrl, icon: Facebook, label: "Facebook" },
    { url: candidate.socials.portfolioUrl, icon: Globe, label: "পোর্টফোলিও" }
  ].filter((item) => item.url);

  return (
    <section>
      {backLink}
      <PageHeader
        title={candidate.publicName}
        subtitle={[candidate.field, availabilityLabel[candidate.availability]].filter(Boolean).join(" · ")}
        action={
          candidate.requestStatus ? (
            <span className="badge badge-success gap-1.5">
              <CheckCircle2 size={13} />
              {candidate.requestStatus === "pending" ? "অনুরোধ পাঠানো হয়েছে" : candidate.requestStatus === "accepted" ? "গৃহীত" : "প্রত্যাখ্যাত"}
            </span>
          ) : (
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleSendRequest}
              disabled={sending}
              className="btn btn-primary btn-sm gap-1.5"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              টিমে যোগ দেওয়ার অনুরোধ পাঠান
            </motion.button>
          )
        }
      />

      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error mb-4 text-sm">
          {error}
        </motion.div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {candidate.publicName[0]}
            </span>
            <p className="font-semibold">{candidate.publicName}</p>
            <p className="mt-1 text-sm text-base-content/60">{candidate.publicBio || "কোনো পরিচিতি দেওয়া হয়নি।"}</p>

            {(candidate.location.city || candidate.location.region) && (
              <p className="mt-3 flex items-center justify-center gap-1 text-xs text-base-content/50">
                <MapPin size={12} /> {candidate.location.city ?? candidate.location.region}
              </p>
            )}

            {socialsList.length > 0 && (
              <div className="mt-4 flex justify-center gap-2">
                {socialsList.map((item) => (
                  <a
                    key={item.label}
                    href={item.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-base-200 text-base-content/60 hover:bg-base-300"
                    aria-label={item.label}
                  >
                    <item.icon size={14} />
                  </a>
                ))}
              </div>
            )}
          </Card>

          <Card className="grid grid-cols-2 gap-3 p-5 text-center">
            <div>
              <p className="flex items-center justify-center gap-1 text-xs text-base-content/50">
                <Award size={12} /> অবদান
              </p>
              <p className="mt-1 text-xl font-bold">{candidate.contributionCount}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-xs text-base-content/50">
                <Star size={12} /> সাফল্যের হার
              </p>
              <p className="mt-1 text-xl font-bold">{candidate.successRate !== null ? `${candidate.successRate}%` : "—"}</p>
            </div>
          </Card>

          {candidate.eligibility && (
            <Card className="p-5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/45">
                <GraduationCap size={13} /> যোগ্যতা
              </p>
              <p className="text-sm text-base-content/80">{candidate.eligibility}</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-base-content/70">ম্যাচ স্কোর</p>
              <span className={`text-2xl font-bold ${scoreTone(candidate.score)}`}>{candidate.score}</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "দক্ষতা মিল", value: candidate.scoreBreakdown.skill, max: 50 },
                { label: "লোকেশন", value: candidate.scoreBreakdown.location, max: 30 },
                { label: "প্রাপ্যতা", value: candidate.scoreBreakdown.availability, max: 20 }
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs text-base-content/55">
                    <span>{item.label}</span>
                    <span>
                      {item.value}/{item.max}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / item.max) * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {candidate.matchedSkills.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-xs text-base-content/50">মিলে যাওয়া দক্ষতা</p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.matchedSkills.map((skill) => (
                    <span key={skill} className="badge badge-success badge-outline badge-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
              <Briefcase size={14} className="text-primary" /> সকল দক্ষতা
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.skills.length ? (
                candidate.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`badge badge-sm ${candidate.matchedSkills.includes(skill) ? "badge-primary" : "badge-outline"}`}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-base-content/50">কোনো দক্ষতা যোগ করা হয়নি।</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
