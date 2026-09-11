import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileText, Loader2, LogIn, Sparkles, Trash2 } from "lucide-react";
import { ThesisSectionList } from "../components/thesis/ThesisSectionList";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { ConfirmButton } from "../components/ui/ConfirmButton";
import { confirmThesis, deleteThesis, getThesis, listTheses } from "../api/thesis";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer } from "../config/motion";
import type { ThesisSummary } from "../types/thesis";

export function ThesisPage() {
  usePageTitle("থিসিস");
  const { token } = useAuth();
  const { params, goTo } = useNavigation();
  const thesisId = params.id;

  if (!token) {
    return (
      <section>
        <PageHeader icon={FileText} title="থিসিস" subtitle="নিশ্চিত করা সকল থিসিসের সংকলন।" />
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

  return thesisId ? <ThesisDetail thesisId={thesisId} /> : <ThesisList />;
}

function ThesisList() {
  const { token } = useAuth();
  const { goTo } = useNavigation();
  const [theses, setTheses] = useState<ThesisSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listTheses(token)
      .then((data) => {
        if (!cancelled) setTheses(data.filter((item) => item.status === "confirmed"));
      })
      .catch(() => {
        if (!cancelled) setError("থিসিসের তালিকা লোড করা যায়নি");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <section>
      <PageHeader icon={FileText} title="থিসিস" subtitle="নিশ্চিত করা সকল থিসিসের সংকলন।" />
      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {!theses ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : theses.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles size={22} />
          </span>
          <p className="font-semibold">এখনো কোনো থিসিস নিশ্চিত করা হয়নি</p>
          <p className="max-w-sm text-sm text-base-content/60">
            AI কনসালট্যান্টের সাথে কথা বলে একটি থিসিস তৈরি করুন এবং নিশ্চিত করুন।
          </p>
          <button type="button" onClick={() => goTo("consultant")} className="btn btn-primary btn-sm mt-1">
            কনসালট্যান্টে যান
          </button>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2">
          {theses.map((thesis) => (
            <Card key={thesis.id} hover className="cursor-pointer p-5" onClick={() => goTo("thesis", { id: thesis.id })}>
              <div className="flex items-start justify-between gap-3">
                <span className="badge badge-success badge-sm gap-1">
                  <CheckCircle2 size={11} /> নিশ্চিত
                </span>
                <span className="text-xs text-base-content/45">v{thesis.version}</span>
              </div>
              <h2 className="mt-3 font-semibold">{thesis.parsedData.idea_summary?.solution || "থিসিস"}</h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-base-content/60">{thesis.parsedData.idea_summary?.problem}</p>
              <p className="mt-4 text-xs text-base-content/45">
                {thesis.confirmedAt
                  ? new Date(thesis.confirmedAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })
                  : ""}
              </p>
            </Card>
          ))}
        </motion.div>
      )}
    </section>
  );
}

function ThesisDetail({ thesisId }: { thesisId: string }) {
  const { token } = useAuth();
  const { goTo } = useNavigation();

  const [thesis, setThesis] = useState<ThesisSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getThesis(token, thesisId)
      .then((data) => {
        if (!cancelled) setThesis(data);
      })
      .catch(() => {
        if (!cancelled) setError("থিসিস লোড করা যায়নি");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

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
      goTo("thesis");
    } catch {
      setError("থিসিস মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
      setDeleting(false);
    }
  }

  const backLink = (
    <button
      type="button"
      onClick={() => goTo("thesis")}
      className="mb-4 flex items-center gap-1.5 text-sm text-base-content/60 hover:text-base-content"
    >
      <ArrowLeft size={14} />
      সব থিসিস
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

  if (!thesis) {
    return (
      <section>
        {backLink}
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-sm text-base-content/60">থিসিসটি খুঁজে পাওয়া যায়নি।</p>
          <button type="button" onClick={() => goTo("thesis")} className="btn btn-primary btn-sm">
            তালিকায় ফিরে যান
          </button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      {backLink}
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
