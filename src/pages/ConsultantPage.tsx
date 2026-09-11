import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Lightbulb, Send, Sparkles, User } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../config/motion";

const modes = [
  { id: "idea", label: "আইডিয়া", description: "পটভূমি, দক্ষতা ও আগ্রহ থেকে সম্ভাব্য আইডিয়া খুঁজে বের করুন।" },
  { id: "validation", label: "ভ্যালিডেশন", description: "বিদ্যমান আইডিয়া নিয়ে গভীর যাচাই সাক্ষাৎকার।" }
] as const;

const suggestedPrompts = ["আমার দক্ষতা কী কাজে লাগবে?", "এই আইডিয়ার বাজার কেমন?", "প্রথম MVP কী হতে পারে?"];

const conversation = [
  { role: "assistant", text: "স্বাগতম। আপনার আইডিয়া বা এখনকার পরিস্থিতি সংক্ষেপে বলুন — আমরা একসাথে এটি যাচাই করব।" },
  { role: "user", text: "ক্ষুদ্র কৃষকদের সরাসরি খুচরা বিক্রেতার সাথে সংযুক্ত করার একটি প্ল্যাটফর্ম বানাতে চাই।" },
  { role: "assistant", text: "চমৎকার। কোন অঞ্চলের কৃষক নিয়ে শুরু করতে চান, এবং এখন তারা কীভাবে পণ্য বিক্রি করেন?" }
];

export function ConsultantPage() {
  usePageTitle("কনসালট্যান্ট");
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("idea");

  return (
    <section>
      <PageHeader
        icon={Bot}
        title="AI স্টার্টআপ কনসালট্যান্ট"
        subtitle="আইডিয়েশন বা ভ্যালিডেশন মোডে কথোপকথন শুরু করার জায়গা।"
      />
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
                    onClick={() => setMode(item.id)}
                    className={`relative overflow-hidden rounded-field border p-3 text-left transition-colors ${
                      active ? "border-primary bg-primary/5" : "border-base-300 hover:border-base-content/20"
                    }`}
                  >
                    {active && (
                      <motion.span layoutId="consultant-mode" className="absolute inset-y-0 left-0 w-1 bg-primary" />
                    )}
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
                  className="rounded-field bg-base-200 px-3 py-2 text-left text-xs text-base-content/70 hover:bg-base-300"
                >
                  {prompt}
                </motion.button>
              ))}
            </motion.div>
          </Card>
        </div>

        <Card className="flex flex-col p-4">
          <div className="scrollbar-thin flex min-h-72 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {conversation.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.3 }}
                className={`flex items-end gap-2 ${message.role === "user" ? "flex-row-reverse self-end" : ""}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    message.role === "user" ? "bg-secondary text-secondary-content" : "bg-primary text-primary-content"
                  }`}
                >
                  {message.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </span>
                <p
                  className={`max-w-sm rounded-2xl px-3.5 py-2.5 text-sm ${
                    message.role === "user" ? "bg-secondary/15 text-base-content" : "bg-base-200 text-base-content"
                  }`}
                >
                  {message.text}
                </p>
              </motion.div>
            ))}
            <div className="flex items-center gap-1.5 pl-9 text-base-content/40">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-base-300 pt-3">
            <Lightbulb size={16} className="shrink-0 text-base-content/30" />
            <input className="input input-bordered flex-1" placeholder="আপনার প্রেক্ষাপট বা আইডিয়া লিখুন" />
            <motion.button whileTap={{ scale: 0.92 }} className="btn btn-primary btn-square" type="button" aria-label="পাঠান">
              <Send size={18} />
            </motion.button>
          </div>
        </Card>
      </div>
    </section>
  );
}
