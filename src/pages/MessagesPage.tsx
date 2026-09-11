import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Inbox, Loader2, LogIn, XCircle } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { listIncomingRequests, respondToRequest } from "../api/requests";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../config/motion";
import type { IncomingRequest } from "../types/request";

const statusTone: Record<string, string> = {
  pending: "badge-warning",
  accepted: "badge-success",
  declined: "badge-error"
};

const statusLabel: Record<string, string> = {
  pending: "অপেক্ষমাণ",
  accepted: "গৃহীত",
  declined: "প্রত্যাখ্যাত"
};

export function MessagesPage() {
  usePageTitle("মেসেজ");
  const { token } = useAuth();
  const { goTo } = useNavigation();

  const [requests, setRequests] = useState<IncomingRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    listIncomingRequests(token)
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch(() => {
        if (!cancelled) setError("অনুরোধের তালিকা লোড করা যায়নি");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleRespond(id: string, status: "accepted" | "declined") {
    if (!token) return;
    setRespondingId(id);
    setError(null);
    try {
      await respondToRequest(token, id, status);
      setRequests((prev) => (prev ? prev.map((item) => (item.id === id ? { ...item, status } : item)) : prev));
    } catch {
      setError("সিদ্ধান্ত জানানো যায়নি, আবার চেষ্টা করুন");
    } finally {
      setRespondingId(null);
    }
  }

  if (!token) {
    return (
      <section>
        <PageHeader icon={Inbox} title="মেসেজ" subtitle="টিমে যোগ দেওয়ার অনুরোধ এখানে দেখা যাবে।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <p className="font-semibold">অনুরোধ দেখতে লগইন করুন</p>
          <button type="button" onClick={() => goTo("login")} className="btn btn-primary btn-sm mt-1">
            লগইন করুন
          </button>
        </Card>
      </section>
    );
  }

  const pendingCount = requests?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <section>
      <PageHeader
        icon={Inbox}
        title="মেসেজ"
        subtitle={pendingCount > 0 ? `${pendingCount}টি নতুন টিম অনুরোধ অপেক্ষমাণ।` : "টিমে যোগ দেওয়ার অনুরোধ এখানে দেখা যাবে।"}
      />

      {error && <div className="alert alert-error mb-4 text-sm">{error}</div>}

      {!requests ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : requests.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox size={22} />
          </span>
          <p className="font-semibold">এখনো কোনো অনুরোধ আসেনি</p>
          <p className="max-w-sm text-sm text-base-content/60">
            কোনো প্রতিষ্ঠাতা আপনার দক্ষতার সাথে মিলিয়ে টিমে যোগ দেওয়ার অনুরোধ পাঠালে এখানে দেখতে পাবেন।
          </p>
        </Card>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
          {requests.map((item) => (
            <motion.article key={item.id} variants={staggerItem}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => goTo("user", { id: item.founder.id })}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {item.founder.publicName[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold hover:underline">{item.founder.publicName}</p>
                        {item.founder.publicBio && <p className="truncate text-xs text-base-content/55">{item.founder.publicBio}</p>}
                      </div>
                    </button>
                  </div>
                  <span className={`badge badge-sm shrink-0 ${statusTone[item.status]}`}>{statusLabel[item.status]}</span>
                </div>

                <div className="mt-3 rounded-field bg-base-200 p-3">
                  <p className="text-sm font-medium">{item.idea.title}</p>
                  {item.idea.pitch && <p className="mt-0.5 text-xs text-base-content/60">{item.idea.pitch}</p>}
                  {item.skillTag && <span className="badge badge-outline badge-sm mt-2">{item.skillTag}</span>}
                </div>

                {item.message && <p className="mt-3 text-sm text-base-content/75">"{item.message}"</p>}

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1 text-xs text-base-content/45">
                    <Clock size={11} />
                    {new Date(item.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  {item.status === "pending" && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        disabled={respondingId === item.id}
                        onClick={() => handleRespond(item.id, "declined")}
                        className="btn btn-ghost btn-sm gap-1.5"
                      >
                        <XCircle size={14} />
                        প্রত্যাখ্যান
                      </motion.button>
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        disabled={respondingId === item.id}
                        onClick={() => handleRespond(item.id, "accepted")}
                        className="btn btn-primary btn-sm gap-1.5"
                      >
                        {respondingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        গ্রহণ করুন
                      </motion.button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.article>
          ))}
        </motion.div>
      )}
    </section>
  );
}
