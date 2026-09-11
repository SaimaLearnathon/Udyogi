import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleDot, FileText, Lightbulb, Rocket, Scale, Target, TrendingUp, Users, Wallet, type LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

const iconCycle: LucideIcon[] = [Target, Lightbulb, TrendingUp, Scale, Rocket, Wallet, FileText, Users];

export function ThesisSectionList({ sections }: { sections: string[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="flex gap-1.5 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
        {sections.map((section, index) => {
          const Icon = iconCycle[index % iconCycle.length];
          const selected = active === index;
          return (
            <button
              key={section}
              type="button"
              onClick={() => setActive(index)}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-field px-3 py-2.5 text-left text-sm font-medium transition-colors lg:shrink ${
                selected ? "text-primary-content" : "text-base-content/70 hover:bg-base-200"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="thesis-section-active"
                  className="absolute inset-0 rounded-field bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={15} className="relative z-10 shrink-0" />
              <span className="relative z-10 whitespace-nowrap">{section}</span>
            </button>
          );
        })}
      </Card>

      <Card className="min-h-64 p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mb-3 flex items-center gap-2 text-primary">
              <CircleDot size={14} />
              <p className="text-xs font-semibold uppercase tracking-wider">সেকশন {active + 1}/{sections.length}</p>
            </div>
            <h2 className="text-lg font-bold">{sections[active]}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-base-content/60">
              এই অংশে কনসালট্যান্ট থেকে তৈরি "{sections[active]}" সম্পর্কিত বিস্তারিত তথ্য বসবে। কথোপকথন সম্পন্ন হলে এখানে
              কাঠামোবদ্ধ সারাংশ দেখা যাবে।
            </p>
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}
