import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Briefcase, ChevronDown, Handshake, Loader2, LogIn, MapPin, Search, Send, Users } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { findCandidatesForSkill, getPublicListing, listPublicListings, listSentRequests } from "../api/listings";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer } from "../config/motion";
import type { PublicCandidate, PublicListingDetail, PublicListingSummary, SentRequest } from "../types/listing";

const priorityTone: Record<string, string> = {
  High: "badge-error",
  Medium: "badge-warning",
  Low: "badge-ghost"
};

function scoreTone(score: number) {
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-error";
}

const availabilityLabel: Record<string, string> = {
  full_time: "পূর্ণকালীন",
  part_time: "আংশিক সময়",
  advisor: "পরামর্শক"
};

export function MatchingPage() {
  usePageTitle("ম্যাচিং");
  const { token } = useAuth();
  const { params, goTo } = useNavigation();
  const listingId = params.id;

  if (!token) {
    return (
      <section>
        <PageHeader icon={Handshake} title="টিমমেট ম্যাচিং" subtitle="নিশ্চিত করা আইডিয়া ও দরকারি দক্ষতা অনুযায়ী টিমমেট খুঁজুন।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <p className="font-semibold">ম্যাচিং দেখতে লগইন করুন</p>
          <button type="button" onClick={() => goTo("login")} className="btn btn-primary btn-sm mt-1">
            লগইন করুন
          </button>
        </Card>
      </section>
    );
  }

  return listingId ? <ListingDetail listingId={listingId} /> : <ListingBoard />;
}

function ListingBoard() {
  const { token } = useAuth();
  const { goTo } = useNavigation();
  const [listings, setListings] = useState<PublicListingSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listPublicListings(token)
      .then((data) => {
        if (!cancelled) setListings(data);
      })
      .catch(() => {
        if (!cancelled) setError("লিস্টিং লোড করা যায়নি");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const filtered = listings?.filter((listing) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.founderName.toLowerCase().includes(query) ||
      listing.requiredSkillsets.some((skill) => skill.skillTag.toLowerCase().includes(query))
    );
  });

  return (
    <section>
      <PageHeader icon={Handshake} title="টিমমেট ম্যাচিং" subtitle="নিশ্চিত করা আইডিয়া ও দরকারি দক্ষতা অনুযায়ী টিমমেট খুঁজুন।" />

      <Card className="mb-4 p-3">
        <label className="input input-bordered input-sm flex items-center gap-2">
          <Search size={14} className="text-base-content/40" />
          <input
            className="grow"
            placeholder="আইডিয়া, প্রতিষ্ঠাতা বা দক্ষতা দিয়ে খুঁজুন"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </Card>

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {!listings ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : filtered && filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Handshake size={22} />
          </span>
          <p className="font-semibold">{listings.length === 0 ? "এখনো কোনো লিস্টিং নেই" : "কোনো ফলাফল পাওয়া যায়নি"}</p>
          <p className="max-w-sm text-sm text-base-content/60">
            {listings.length === 0
              ? "থিসিস নিশ্চিত করলে সেটি স্বয়ংক্রিয়ভাবে এখানে দেখা যাবে।"
              : "ভিন্ন শব্দ দিয়ে আবার খুঁজে দেখুন।"}
          </p>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2">
          {filtered?.map((listing) => (
            <Card key={listing.id} hover className="cursor-pointer p-5" onClick={() => goTo("matching", { id: listing.id })}>
              <h2 className="font-semibold">{listing.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-base-content/60">{listing.pitch}</p>
              <p className="mt-3 text-xs text-base-content/45">প্রতিষ্ঠাতা: {listing.founderName}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {listing.requiredSkillsets.slice(0, 4).map((skill) => (
                  <span key={skill.skillTag} className={`badge badge-sm ${priorityTone[skill.priority] ?? "badge-ghost"}`}>
                    {skill.skillTag}
                  </span>
                ))}
                {listing.requiredSkillsets.length > 4 && (
                  <span className="badge badge-ghost badge-sm">+{listing.requiredSkillsets.length - 4}</span>
                )}
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </section>
  );
}

function ListingDetail({ listingId }: { listingId: string }) {
  const { token } = useAuth();
  const { goTo } = useNavigation();

  const [listing, setListing] = useState<PublicListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Record<string, PublicCandidate[] | "loading" | "error">>({});
  const [sentRequests, setSentRequests] = useState<Record<string, SentRequest>>({});

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPublicListing(token, listingId)
      .then((data) => {
        if (!cancelled) setListing(data);
      })
      .catch(() => {
        if (!cancelled) setError("লিস্টিং লোড করা যায়নি");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    listSentRequests(token, listingId)
      .then((data) => {
        if (cancelled) return;
        setSentRequests(Object.fromEntries(data.map((request) => [request.candidateId, request])));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [token, listingId]);

  async function toggleSkill(skillTag: string) {
    if (expandedSkill === skillTag) {
      setExpandedSkill(null);
      return;
    }
    setExpandedSkill(skillTag);
    if (!token || candidates[skillTag]) return;

    setCandidates((prev) => ({ ...prev, [skillTag]: "loading" }));
    try {
      const result = await findCandidatesForSkill(token, listingId, skillTag);
      setCandidates((prev) => ({ ...prev, [skillTag]: result }));
    } catch {
      setCandidates((prev) => ({ ...prev, [skillTag]: "error" }));
    }
  }

  const backLink = (
    <button
      type="button"
      onClick={() => goTo("matching")}
      className="mb-4 flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content"
    >
      <ArrowLeft size={14} />
      সব লিস্টিং
    </button>
  );

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

  if (!listing) {
    return (
      <section>
        {backLink}
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-base-content/60">{error ?? "লিস্টিংটি খুঁজে পাওয়া যায়নি।"}</p>
          <button type="button" onClick={() => goTo("matching")} className="btn btn-primary btn-sm">
            তালিকায় ফিরে যান
          </button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      {backLink}
      <PageHeader icon={Handshake} title={listing.title} subtitle={`প্রতিষ্ঠাতা: ${listing.founderName}`} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Card className="space-y-3 p-5">
            <span className={`badge ${listing.feasibilityRating === "High" ? "badge-success" : listing.feasibilityRating === "Medium" ? "badge-warning" : "badge-error"}`}>
              সম্ভাব্যতা: {listing.feasibilityRating}
            </span>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/45">সমস্যা</p>
              <p className="text-sm text-base-content/80">{listing.ideaSummary.problem}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/45">সমাধান</p>
              <p className="text-sm text-base-content/80">{listing.ideaSummary.solution}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/45">লক্ষ্য গ্রাহক</p>
              <p className="text-sm text-base-content/80">{listing.ideaSummary.target_customer}</p>
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/45">প্রতিষ্ঠাতা সম্পর্কে</p>
            <p className="text-sm text-base-content/80">{listing.founderBio || "কোনো পরিচিতি দেওয়া হয়নি।"}</p>
          </Card>
        </div>

        <Card className="p-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
            <Briefcase size={14} className="text-primary" /> প্রয়োজনীয় দক্ষতা
          </p>
          <div className="space-y-2">
            {listing.requiredSkillsets.map((skill) => {
              const isOpen = expandedSkill === skill.skillTag;
              const result = candidates[skill.skillTag];
              return (
                <div key={skill.skillTag} className="rounded-field border border-base-300">
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill.skillTag)}
                    className="flex w-full items-center justify-between gap-3 p-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{skill.skillTag}</span>
                        <span className={`badge badge-sm ${priorityTone[skill.priority] ?? "badge-ghost"}`}>{skill.priority}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-base-content/55">{skill.description}</p>
                    </div>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-base-content/40">
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-base-300 bg-base-200/50"
                      >
                        <div className="space-y-2 p-3">
                          {result === "loading" && (
                            <div className="flex items-center gap-2 text-sm text-base-content/55">
                              <Loader2 size={14} className="animate-spin" /> খোঁজা হচ্ছে...
                            </div>
                          )}
                          {result === "error" && <p className="text-sm text-error">টিমমেট খুঁজতে সমস্যা হয়েছে।</p>}
                          {Array.isArray(result) && result.length === 0 && (
                            <p className="flex items-center gap-1.5 text-sm text-base-content/55">
                              <Users size={14} /> এই দক্ষতায় এখনো কোনো টিমমেট পাওয়া যায়নি।
                            </p>
                          )}
                          {Array.isArray(result) &&
                            result.map((candidate) => {
                              const sent = sentRequests[candidate.id];
                              return (
                                <button
                                  key={candidate.id}
                                  type="button"
                                  onClick={() =>
                                    goTo("candidate", { listing: listingId, id: candidate.id, skill: skill.skillTag })
                                  }
                                  className="w-full rounded-field bg-base-100 p-3 text-left transition-colors hover:bg-base-100/70"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium">{candidate.publicName}</p>
                                    <div className="flex shrink-0 items-center gap-2">
                                      {sent && (
                                        <span className="badge badge-success badge-sm gap-1">
                                          <Send size={10} /> পাঠানো হয়েছে
                                        </span>
                                      )}
                                      <span className={`text-sm font-bold ${scoreTone(candidate.score)}`}>{candidate.score}</span>
                                    </div>
                                  </div>
                                  {candidate.publicBio && <p className="mt-1 text-xs text-base-content/60">{candidate.publicBio}</p>}
                                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-base-content/50">
                                    <span className="badge badge-outline badge-sm">{availabilityLabel[candidate.availability]}</span>
                                    {candidate.field && (
                                      <span className="flex items-center gap-1">
                                        <Briefcase size={11} /> {candidate.field}
                                      </span>
                                    )}
                                    {(candidate.location.city || candidate.location.region) && (
                                      <span className="flex items-center gap-1">
                                        <MapPin size={11} /> {candidate.location.city ?? candidate.location.region}
                                      </span>
                                    )}
                                  </div>
                                  {candidate.skills.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {candidate.skills.map((s) => (
                                        <span
                                          key={s}
                                          className={`badge badge-sm ${
                                            candidate.matchedSkills.includes(s) ? "badge-primary" : "badge-ghost"
                                          }`}
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}
