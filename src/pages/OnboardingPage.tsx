import { ArrowRight, Bot, FileText, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "../components/ui/PageHeader";
import { StatPill } from "../components/ui/StatPill";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "../context/NavigationContext";
import { usePageTitle } from "../hooks/usePageTitle";
import { staggerContainer, staggerItem } from "../config/motion";

const flowSteps = [
  {
    icon: Bot,
    title: "AI কনসালট্যান্ট",
    description: "আইডিয়া বা বিদ্যমান পরিকল্পনা নিয়ে কথোপকথনে যাচাই ও দিকনির্দেশনা পান।",
    page: "consultant" as const
  },
  {
    icon: FileText,
    title: "থিসিস ওয়ার্কস্পেস",
    description: "৮টি কাঠামোবদ্ধ সেকশনে খসড়া থেকে নিশ্চিত পরিকল্পনায় নিয়ে যান।",
    page: "workspace" as const
  },
  {
    icon: Handshake,
    title: "টিমমেট ম্যাচিং",
    description: "স্বচ্ছ স্কোরসহ উপযুক্ত সহ-প্রতিষ্ঠাতা বা টিমমেট খুঁজুন।",
    page: "matching" as const
  }
];

export function OnboardingPage() {
  const { goTo } = useNavigation();
  const { user } = useAuth();
  usePageTitle("শুরু");

  return (
    <section>
      {user && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-sm font-medium text-base-content/55"
        >
          স্বাগতম, {user.publicName}
        </motion.p>
      )}
      <PageHeader
        title="ধারণাকে পরিকল্পনা, পরিকল্পনাকে দলে রূপ দিন"
        subtitle="AI কনসালট্যান্ট, থিসিস ওয়ার্কস্পেস এবং স্বচ্ছ ম্যাচিং স্কোর দিয়ে বাংলাদেশি প্রতিষ্ঠাতাদের জন্য একটি কাজের জায়গা।"
      />

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid gap-3 sm:grid-cols-3">
        <StatPill label="মূল ফ্লো" value="৩" />
        <StatPill label="থিসিস সেকশন" value="৮" />
        <StatPill label="ম্যাচিং স্কোর" value="০-১০০" />
      </motion.div>

      <motion.button
        type="button"
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.97 }}
        className="btn btn-primary mt-6 gap-2"
        onClick={() => goTo("consultant")}
      >
        শুরু করুন
        <ArrowRight size={18} />
      </motion.button>

      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="mt-10 grid gap-4 md:grid-cols-3">
        {flowSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} hover className="group cursor-pointer p-5" onClick={() => goTo(step.page)}>
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-field bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                  <Icon size={20} />
                </span>
                <span className="text-2xl font-bold text-base-content/15">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1.5 text-sm text-base-content/60">{step.description}</p>
              <motion.span
                variants={staggerItem}
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
              >
                দেখুন <ArrowRight size={14} />
              </motion.span>
            </Card>
          );
        })}
      </motion.div>
    </section>
  );
}
