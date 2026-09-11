import { motion, useReducedMotion } from "framer-motion";
import { Bot, MapPin, Sparkles } from "lucide-react";

export function HeroVisual() {
  const prefersReducedMotion = useReducedMotion();
  const float = (delay: number) =>
    prefersReducedMotion
      ? {}
      : {
          animate: { y: [0, -10, 0] },
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay }
        };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <div className="absolute inset-6 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute inset-14 rounded-full border border-primary/20" />
      <div className="absolute inset-24 rounded-full border border-primary/15" />

      <motion.div
        {...float(0)}
        className="absolute left-1/2 top-6 w-56 -translate-x-1/2 rounded-box border border-base-300 bg-base-100 p-3.5 shadow-lg"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-content">
            <Bot size={12} />
          </span>
          <p className="text-xs font-semibold">AI কনসালট্যান্ট</p>
        </div>
        <p className="rounded-field bg-base-200 p-2 text-[11px] leading-relaxed text-base-content/70">
          আপনার আইডিয়ার বাজার সম্ভাবনা যাচাই করছি...
        </p>
      </motion.div>

      <motion.div
        {...float(1)}
        className="absolute bottom-10 left-0 w-40 rounded-box border border-base-300 bg-base-100 p-3.5 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="radial-progress text-success text-xs font-bold" style={{ "--value": 87, "--size": "2.5rem" } as React.CSSProperties}>
            ৮৭
          </div>
          <div>
            <p className="text-xs font-semibold">ম্যাচ স্কোর</p>
            <p className="text-[10px] text-base-content/50">ফুলস্ট্যাক ইঞ্জিনিয়ার</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...float(2)}
        className="absolute bottom-4 right-0 flex w-36 items-center gap-2 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <MapPin size={13} />
        </span>
        <p className="text-[11px] font-medium leading-tight">৩ কিমি দূরে ৪ জন উদ্যোক্তা</p>
      </motion.div>

      <motion.div
        {...float(0.6)}
        className="absolute right-2 top-24 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-content shadow-lg"
      >
        <Sparkles size={12} />
        <span className="text-[11px] font-semibold">সিড গ্রান্ট উপলব্ধ</span>
      </motion.div>
    </div>
  );
}
