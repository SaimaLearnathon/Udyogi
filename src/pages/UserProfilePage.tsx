import { useEffect, useState } from "react";
import { Award, Briefcase, Facebook, GraduationCap, Globe, Linkedin, Loader2, LogIn, ArrowLeft, MapPin, Star } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { CurrentProjectsCard } from "../components/profile/CurrentProjectsCard";
import { getPublicProfile } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import type { PublicUser } from "../types/profile";

const availabilityLabel: Record<string, string> = {
  full_time: "পূর্ণকালীন",
  part_time: "আংশিক সময়",
  advisor: "পরামর্শক"
};

export function UserProfilePage() {
  usePageTitle("প্রোফাইল");
  const { token } = useAuth();
  const { params, goTo } = useNavigation();
  const userId = params.id;

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPublicProfile(token, userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
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
  }, [token, userId]);

  const backLink = (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? window.history.back() : goTo("messages"))}
      className="mb-4 flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content"
    >
      <ArrowLeft size={14} />
      ফিরে যান
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

  if (!profile) {
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
    { url: profile.socials.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
    { url: profile.socials.facebookUrl, icon: Facebook, label: "Facebook" },
    { url: profile.socials.portfolioUrl, icon: Globe, label: "পোর্টফোলিও" }
  ].filter((item) => item.url);

  return (
    <section>
      {backLink}
      <PageHeader
        title={profile.publicName}
        subtitle={[profile.field, availabilityLabel[profile.availability]].filter(Boolean).join(" · ")}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <Card className="p-5 text-center">
            <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {profile.publicName[0]}
            </span>
            <p className="font-semibold">{profile.publicName}</p>
            <p className="mt-1 text-sm text-base-content/60">{profile.publicBio || "কোনো পরিচিতি দেওয়া হয়নি।"}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              {profile.isFounder && <span className="badge badge-outline badge-sm">প্রতিষ্ঠাতা</span>}
              {profile.isSeeker && <span className="badge badge-outline badge-sm">টিমমেট প্রত্যাশী</span>}
            </div>

            {(profile.location.city || profile.location.region) && (
              <p className="mt-3 flex items-center justify-center gap-1 text-xs text-base-content/50">
                <MapPin size={12} /> {profile.location.city ?? profile.location.region}
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
              <p className="mt-1 text-xl font-bold">{profile.contributionCount}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-xs text-base-content/50">
                <Star size={12} /> সাফল্যের হার
              </p>
              <p className="mt-1 text-xl font-bold">{profile.successRate !== null ? `${profile.successRate}%` : "—"}</p>
            </div>
          </Card>

          {profile.eligibility && (
            <Card className="p-5">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/45">
                <GraduationCap size={13} /> যোগ্যতা
              </p>
              <p className="text-sm text-base-content/80">{profile.eligibility}</p>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
              <Briefcase size={14} className="text-primary" /> দক্ষতা
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.length ? (
                profile.skills.map((skill) => (
                  <span key={skill} className="badge badge-outline badge-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-base-content/50">কোনো দক্ষতা যোগ করা হয়নি।</p>
              )}
            </div>
          </Card>

          {profile.interests.length > 0 && (
            <Card className="p-5">
              <p className="mb-2 text-sm font-semibold text-base-content/70">আগ্রহ</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((interest) => (
                  <span key={interest} className="badge badge-outline badge-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </Card>
          )}

          <CurrentProjectsCard projects={profile.currentProjects} />
        </div>
      </div>
    </section>
  );
}
