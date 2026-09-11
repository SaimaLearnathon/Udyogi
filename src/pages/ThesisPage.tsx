import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Loader2, LogIn, Trash2 } from "lucide-react";
import { ThesisSectionList } from "../components/thesis/ThesisSectionList";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { ConfirmButton } from "../components/ui/ConfirmButton";
import { confirmThesis, deleteThesis, getThesis, listTheses } from "../api/thesis";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import type { ThesisSummary } from "../types/thesis";

export function ThesisPage() {
  usePageTitle("থিসিস");
  const { token } = useAuth();
  const { params, goTo } = useNavigation();
  const thesisId = params.id;

  const [thesis, setThesis] = useState<ThesisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        if (thesisId) {
          const detail = await getThesis(token!, thesisId);
          if (!cancelled) setThesis(detail);
        } else {
          const list = await listTheses(token!);
          if (!cancelled) setThesis(list[0] ?? null);
        }
      } catch {
        if (!cancelled) setError("থিসিস লোড করা যায়নি");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, thesisId]);

  async function handleConfirm() {
    if (!thesis || !token) return;
    setConfirming(true);
    try {
      const updated = await confirmThesis(token, thesis.id);
      setThesis(updated);
    } catch {
      setError("থিসিস নিশ্চিত করা যায়নি, আবার চেষ্টা করুন");
    } finally {
      setConfirming(false);
    }
  }

  async function handleDelete() {
    if (!thesis || !token) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteThesis(token, thesis.id);
      goTo("workspace");
    } catch {
      setError("থিসিস মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
      setDeleting(false);
    }
  }

  if (!token) {
    return (
      <section>
        <PageHeader icon={FileText} title="থিসিস" subtitle="আটটি কাঠামোবদ্ধ সেকশনে পরিকল্পনা পর্যালোচনা।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <p className="font-semibold">থিসিস দেখতে লগইন করুন</p>
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
        <PageHeader icon={FileText} title="থিসিস" subtitle="আটটি কাঠামোবদ্ধ সেকশনে পরিকল্পনা পর্যালোচনা।" />
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </section>
    );
  }

  if (!thesis) {
    return (
      <section>
        <PageHeader icon={FileText} title="থিসিস" subtitle="এখনো কোনো থিসিস তৈরি হয়নি।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-base-content/60">AI কনসালট্যান্টের সাথে কথা বলে প্রথম থিসিস তৈরি করুন।</p>
          <button type="button" onClick={() => goTo("consultant")} className="btn btn-primary btn-sm">
            কনসালট্যান্টে যান
          </button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        icon={FileText}
        title={thesis.parsedData.idea_summary?.solution || "থিসিস"}
        subtitle={`ভার্সন ${thesis.version} · আটটি কাঠামোবদ্ধ সেকশনে পরিকল্পনা পর্যালোচনা।`}
        action={
          <div className="flex items-center gap-2">
            {thesis.status === "confirmed" ? (
              <span className="badge badge-success gap-1.5">
                <CheckCircle2 size={13} /> নিশ্চিত
              </span>
            ) : (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleConfirm}
                disabled={confirming || deleting}
                className="btn btn-primary btn-sm gap-1.5"
              >
                {confirming ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                থিসিস নিশ্চিত করুন
              </motion.button>
            )}
            <ConfirmButton icon={Trash2} label="মুছুন" confirmLabel="নিশ্চিত?" disabled={deleting} onConfirm={handleDelete} />
          </div>
        }
      />
      {error && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error mb-4 text-sm">
          {error}
        </motion.div>
      )}
      <ThesisSectionList data={thesis.parsedData} />
    </section>
  );
}
