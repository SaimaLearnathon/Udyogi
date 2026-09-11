import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, Loader2, LogIn } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { listMyProjects } from "../api/requests";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer } from "../config/motion";
import type { PublicCurrentProject } from "../types/profile";

export function MyWorkPage() {
  usePageTitle("আমার কাজ");
  const { token } = useAuth();
  const { goTo } = useNavigation();

  const [projects, setProjects] = useState<PublicCurrentProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listMyProjects(token)
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch(() => {
        if (!cancelled) setError("প্রজেক্টের তালিকা লোড করা যায়নি");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <section>
        <PageHeader icon={ClipboardList} title="আমার কাজ" subtitle="যেসব টিমে আপনি যুক্ত হয়েছেন সেগুলো এখানে দেখা যাবে।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <p className="font-semibold">দেখতে লগইন করুন</p>
          <button type="button" onClick={() => goTo("login")} className="btn btn-primary btn-sm mt-1">
            লগইন করুন
          </button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <PageHeader icon={ClipboardList} title="আমার কাজ" subtitle="যেসব টিমে আপনি যুক্ত হয়েছেন সেগুলোর বিস্তারিত এখানে দেখা যাবে।" />

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {!projects ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : projects.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList size={22} />
          </span>
          <p className="font-semibold">এখনো কোনো টিমে যুক্ত হননি</p>
          <p className="max-w-sm text-sm text-base-content/60">
            কোনো প্রতিষ্ঠাতার অনুরোধ গ্রহণ করলে সেই প্রজেক্টটি এখানে দেখা যাবে।
          </p>
          <button type="button" onClick={() => goTo("messages")} className="btn btn-primary btn-sm mt-1">
            মেসেজ দেখুন
          </button>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.thesisId}
              hover
              className="cursor-pointer p-5"
              onClick={() => goTo("thesis", { id: project.thesisId })}
            >
              <h2 className="font-semibold">{project.title}</h2>
              {project.pitch && <p className="mt-1.5 line-clamp-2 text-sm text-base-content/60">{project.pitch}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="badge badge-outline badge-sm">প্রতিষ্ঠাতা: {project.founderName}</span>
                {project.skillTag && <span className="badge badge-primary badge-outline badge-sm">{project.skillTag}</span>}
              </div>
              <p className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                বিস্তারিত দেখুন <ArrowRight size={12} />
              </p>
            </Card>
          ))}
        </motion.div>
      )}
    </section>
  );
}
