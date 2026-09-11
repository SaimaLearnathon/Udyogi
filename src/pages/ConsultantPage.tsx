import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bot, CheckCircle2, Loader2, LogIn, Send, Sparkles, User } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Markdown } from "../components/ui/Markdown";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../config/motion";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { createConsultantSession, getConsultantSession, sendConsultantMessage, type ConsultantMode } from "../api/consultant";
import { confirmThesis } from "../api/thesis";
import type { ThesisParsedData } from "../types/thesis";

const modes: { id: ConsultantMode; label: string; description: string }[] = [
  { id: "ideation", label: "আইডিয়া", description: "পটভূমি, দক্ষতা ও আগ্রহ থেকে সম্ভাব্য আইডিয়া খুঁজে বের করুন।" },
  { id: "validation", label: "ভ্যালিডেশন", description: "বিদ্যমান আইডিয়া নিয়ে গভীর যাচাই সাক্ষাৎকার।" }
];

const suggestedPrompts = ["আমার দক্ষতা কী কাজে লাগবে?", "এই আইডিয়ার বাজার কেমন?", "প্রথম MVP কী হতে পারে?"];

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
}

interface DraftThesis {
  id: string;
  version: number;
  status: "draft" | "confirmed";
  parsedData: ThesisParsedData;
}

const priorityTone: Record<string, string> = {
  High: "badge-error",
  Medium: "badge-warning",
  Low: "badge-ghost"
};

export function ConsultantPage() {
  usePageTitle("কনসালট্যান্ট");
  const { token } = useAuth();
  const { goTo, params } = useNavigation();
  const resumeSessionId = params.session;

  const [mode, setMode] = useState<ConsultantMode>("ideation");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thesis, setThesis] = useState<DraftThesis | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function resetToEmptySession(nextMode: ConsultantMode) {
    setSessionId(null);
    setMessages([]);
    setThesis(null);
    setError(null);
    setAwaitingConfirmation(false);
    setMode(nextMode);
  }

  async function resumeSession(id: string) {
    if (!token) return;
    setLoadingSession(true);
    setError(null);

    try {
      const detail = await getConsultantSession(token, id);
      setSessionId(detail.id);
      setMode(detail.mode);
      setMessages(
        detail.messages
          .filter((message) => message.role === "user" || message.role === "assistant")
          .map((message) => ({ role: message.role as "user" | "assistant", text: message.content }))
      );
      const latestThesis = detail.theses[0];
      setThesis(
        latestThesis
          ? { id: latestThesis.id, version: latestThesis.version, status: latestThesis.status, parsedData: latestThesis.parsedData }
          : null
      );
    } catch {
      setError("সেশন লোড করা যায়নি, নতুন কথোপকথন শুরু করুন");
      window.history.replaceState(null, "", "#consultant");
      resetToEmptySession("ideation");
    } finally {
      setLoadingSession(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setLoadingSession(false);
      return;
    }
    if (resumeSessionId) {
      resumeSession(resumeSessionId);
    } else {
      resetToEmptySession(mode);
      setLoadingSession(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, resumeSessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleModeSelect(nextMode: ConsultantMode) {
    if (nextMode === mode || sending || loadingSession) return;
    if (resumeSessionId) {
      window.history.replaceState(null, "", "#consultant");
    }
    resetToEmptySession(nextMode);
  }

  async function ensureSession(): Promise<string | null> {
    if (sessionId) return sessionId;
    if (!token) return null;
    try {
      const session = await createConsultantSession(token, mode);
      setSessionId(session.id);
      return session.id;
    } catch {
      setError("নতুন সেশন শুরু করা যায়নি, আবার চেষ্টা করুন");
      return null;
    }
  }

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || !token || sending) return;

    setInput("");
    setError(null);
    setAwaitingConfirmation(false);
    setSending(true);

    const activeSessionId = await ensureSession();
    if (!activeSessionId) {
      setSending(false);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: content }, { role: "assistant", text: "", streaming: true }]);

    await sendConsultantMessage(token, activeSessionId, content, {
      onText: (chunk) => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, text: last.text + chunk };
          return next;
        });
      },
      onThesis: (draft) => {
        setThesis(draft);
        setAwaitingConfirmation(false);
      },
      onConfirmationRequest: () => {
        setAwaitingConfirmation(true);
      },
      onError: (message) => {
        setError(message);
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant" && !last.text) next.pop();
          return next;
        });
      },
      onDone: () => {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant") next[next.length - 1] = { ...last, streaming: false };
          return next;
        });
        setSending(false);
      }
    });

    setSending(false);
  }

  function respondToConfirmation(agree: boolean) {
    setAwaitingConfirmation(false);
    handleSend(agree ? "হ্যাঁ, বিস্তারিত বিশ্লেষণ করে এগিয়ে যান।" : "না, আমি আরও কিছু তথ্য যোগ করতে চাই।");
  }

  async function handleConfirmThesis() {
    if (!thesis || !token) return;
    setConfirming(true);
    try {
      const updated = await confirmThesis(token, thesis.id);
      goTo("thesis", { id: updated.id });
    } catch {
      setError("থিসিস নিশ্চিত করা যায়নি, আবার চেষ্টা করুন");
      setConfirming(false);
    }
  }

  if (!token) {
    return (
      <section>
        <PageHeader icon={Bot} title="AI স্টার্টআপ কনসালট্যান্ট" subtitle="আইডিয়েশন বা ভ্যালিডেশন মোডে কথোপকথন শুরু করার জায়গা।" />
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogIn size={22} />
          </span>
          <p className="font-semibold">কনসালট্যান্টের সাথে কথা বলতে লগইন করুন</p>
          <p className="max-w-sm text-sm text-base-content/60">আপনার কথোপকথন ও থিসিস নিরাপদে সংরক্ষণ করতে একটি অ্যাকাউন্ট প্রয়োজন।</p>
          <button type="button" onClick={() => goTo("login")} className="btn btn-primary btn-sm mt-1">
            লগইন করুন
          </button>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <PageHeader icon={Bot} title="AI স্টার্টআপ কনসালট্যান্ট" subtitle="আইডিয়েশন বা ভ্যালিডেশন মোডে কথোপকথন শুরু করার জায়গা।" />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card className="p-4">
            <p className="mb-3 text-sm font-semibold text-base-content/70">মোড নির্বাচন করুন</p>
            <div className="relative grid gap-2">
              {modes.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={sending || loadingSession}
                    onClick={() => handleModeSelect(item.id)}
                    className={`relative overflow-hidden rounded-field border p-3 text-left transition-colors disabled:opacity-60 ${
                      active ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/20"
                    }`}
                  >
                    {active && <motion.span layoutId="consultant-mode" className="absolute inset-y-0 left-0 w-1 bg-primary" />}
                    <p className={`text-sm font-semibold ${active ? "text-primary" : ""}`}>{item.label}</p>
                    <p className="mt-0.5 text-xs text-base-content/55">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-base-content/70">
              <Sparkles size={14} className="text-secondary" /> পরামর্শকৃত প্রশ্ন
            </p>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="flex flex-col gap-2">
              {suggestedPrompts.map((prompt) => (
                <motion.button
                  key={prompt}
                  variants={staggerItem}
                  whileHover={{ x: 2 }}
                  type="button"
                  disabled={sending || loadingSession}
                  onClick={() => handleSend(prompt)}
                  className="rounded-field bg-base-200 px-3 py-2 text-left text-xs text-base-content/70 hover:bg-base-300 disabled:opacity-50"
                >
                  {prompt}
                </motion.button>
              ))}
            </motion.div>
          </Card>

          {thesis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-base-content/70">থিসিস ড্রাফট · v{thesis.version}</p>
                  <span className={`badge badge-sm ${thesis.status === "confirmed" ? "badge-success" : "badge-warning"}`}>
                    {thesis.status === "confirmed" ? "নিশ্চিত" : "খসড়া"}
                  </span>
                </div>
                <p className="text-sm font-medium">{thesis.parsedData.idea_summary?.solution}</p>
                <div className="flex flex-wrap gap-1.5">
                  {thesis.parsedData.required_skillsets?.slice(0, 6).map((skill) => (
                    <span key={skill.skill_tag} className={`badge badge-sm ${priorityTone[skill.priority] ?? "badge-ghost"}`}>
                      {skill.skill_tag}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => goTo("thesis", { id: thesis.id })}
                  className="btn btn-outline btn-sm w-full gap-1.5"
                >
                  থিসিস দেখুন
                </motion.button>
                {thesis.status !== "confirmed" && (
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    disabled={confirming}
                    onClick={handleConfirmThesis}
                    className="btn btn-primary btn-sm w-full gap-1.5"
                  >
                    {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    থিসিস নিশ্চিত করুন
                  </motion.button>
                )}
              </Card>
            </motion.div>
          )}
        </div>

        <Card className="flex h-[75vh] max-h-[46rem] min-h-[26rem] flex-col p-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-warning mb-3 gap-2 py-2 text-xs"
            >
              <AlertTriangle size={14} />
              {error}
            </motion.div>
          )}

          <div ref={scrollRef} className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {loadingSession && (
              <div className="m-auto flex flex-col items-center gap-2 text-base-content/45">
                <Loader2 className="animate-spin" size={20} />
                <p className="text-sm">লোড হচ্ছে...</p>
              </div>
            )}
            {!loadingSession && messages.length === 0 && (
              <p className="m-auto max-w-xs text-center text-sm text-base-content/45">
                নিচে আপনার আইডিয়া বা প্রেক্ষাপট লিখে কথোপকথন শুরু করুন।
              </p>
            )}
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-end gap-2 ${message.role === "user" ? "flex-row-reverse self-end" : ""}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user" ? "bg-secondary text-secondary-content" : "bg-primary text-primary-content"
                  }`}
                >
                  {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </span>
                <div
                  className={`max-w-sm rounded-2xl px-3.5 py-2.5 text-sm ${
                    message.role === "user" ? "bg-secondary/15 text-base-content" : "bg-base-200 text-base-content"
                  }`}
                >
                  {message.role === "assistant" ? (
                    message.text ? (
                      <Markdown>{message.text}</Markdown>
                    ) : null
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  {message.streaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-current align-middle" />}
                </div>
              </motion.div>
            ))}
            {awaitingConfirmation && !sending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2 pl-9"
              >
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => respondToConfirmation(true)}
                  className="btn btn-primary btn-sm gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  হ্যাঁ, বিস্তারিত বিশ্লেষণ করুন
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => respondToConfirmation(false)}
                  className="btn btn-outline btn-sm"
                >
                  আরও যোগ করতে চাই
                </motion.button>
              </motion.div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-base-300 pt-3">
            <input
              className="input input-bordered flex-1"
              placeholder="আপনার প্রেক্ষাপট বা আইডিয়া লিখুন"
              value={input}
              disabled={loadingSession || sending}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <motion.button
              whileTap={{ scale: 0.92 }}
              className="btn btn-primary btn-square"
              type="button"
              aria-label="পাঠান"
              disabled={loadingSession || sending || !input.trim()}
              onClick={() => handleSend()}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </Card>
      </div>
    </section>
  );
}
