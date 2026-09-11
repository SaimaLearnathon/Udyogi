import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Layers, Loader2, LogIn, MessageSquare, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { ConfirmButton } from "../components/ui/ConfirmButton";
import { deleteConsultantSession, listConsultantSessions, type ConsultantSessionListItem } from "../api/consultant";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer } from "../config/motion";

const modeLabel: Record<string, string> = { ideation: "আইডিয়া", validation: "ভ্যালিডেশন" };

export function WorkspacePage() {
  const { token } = useAuth();
  const { goTo } = useNavigation();
  usePageTitle("ওয়ার্কস্পেস");

  const [sessions, setSessions] = useState<ConsultantSessionListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listConsultantSessions(token)
      .then((data) => {
        if (!cancelled) setSessions(data);
      })
      .catch(() => {
        if (!cancelled) setError("সেশনের তালিকা লোড করা যায়নি");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleDelete(sessionId: string) {
    if (!token) return;
    setDeletingId(sessionId);
    setError(null);
    try {
      await deleteConsultantSession(token, sessionId);
      setSessions((prev) => prev?.filter((session) => session.id !== sessionId) ?? prev);
    } catch {
      setError("সেশন মুছে ফেলা যায়নি, আবার চেষ্টা করুন");
    } finally {
      setDeletingId(null);
    }
  }

  if (!token) {
    return (
      <section>
        <PageHeader icon={Layers} title="থিসিস ওয়ার্কস্পেস" subtitle="খসড়া, নিশ্চিত ভার্সন এবং প্রকাশযোগ্য পরিকল্পনা এক জায়গায়।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <p className="font-semibold">ওয়ার্কস্পেস দেখতে লগইন করুন</p>
          <button type="button" onClick={() => goTo("login")} className="btn btn-primary btn-sm mt-1">
            লগইন করুন
          </button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <PageHeader icon={Layers} title="থিসিস ওয়ার্কস্পেস" subtitle="খসড়া, নিশ্চিত ভার্সন এবং প্রকাশযোগ্য পরিকল্পনা এক জায়গায়।" />

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {!sessions ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot size={22} />
          </span>
          <p className="font-semibold">এখনো কোনো কথোপকথন শুরু হয়নি</p>
          <p className="max-w-sm text-sm text-base-content/60">AI কনসালট্যান্টের সাথে কথা বলে আপনার প্রথম আইডিয়া যাচাই করুন।</p>
          <button type="button" onClick={() => goTo("consultant")} className="btn btn-primary btn-sm mt-1">
            কনসালট্যান্টে যান
          </button>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <Card
              key={session.id}
              hover
              className="cursor-pointer p-5"
              onClick={() => goTo("consultant", { session: session.id })}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="badge badge-outline badge-sm">{modeLabel[session.mode] ?? session.mode}</span>
                {session.thesis && (
                  <span className={`badge badge-sm ${session.thesis.status === "confirmed" ? "badge-success" : "badge-warning"}`}>
                    {session.thesis.status === "confirmed" ? "থিসিস নিশ্চিত" : "থিসিস খসড়া"}
                  </span>
                )}
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-base-content/70">
                {session.lastMessage ?? "কথোপকথন এখনো শুরু হয়নি"}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-base-content/45">
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} />
                    {session.messageCount} বার্তা
                  </span>
                  <span>{new Date(session.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}</span>
                </div>
                <ConfirmButton
                  icon={Trash2}
                  label="মুছুন"
                  confirmLabel="নিশ্চিত?"
                  disabled={deletingId === session.id}
                  onConfirm={() => handleDelete(session.id)}
                />
              </div>
            </Card>
          ))}

          <motion.button
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => goTo("consultant")}
            className="flex min-h-45 flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-base-300 text-base-content/50 transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={22} />
            <span className="text-sm font-medium">নতুন থিসিস শুরু করুন</span>
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}
