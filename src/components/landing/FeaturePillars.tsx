import { motion } from "framer-motion";
import { Bot, FileText, Handshake } from "lucide-react";
import { staggerContainer, staggerItem } from "../../config/motion";

const pillars = [
  {
    icon: Bot,
    title: "AI স্টার্টআপ কনসালট্যান্ট",
    description: "আইডিয়েশন বা ভ্যালিডেশন মোডে কথোপকথনের মাধ্যমে সম্ভাবনা, বাজার ও ঝুঁকি যাচাই করুন।"
  },
  {
    icon: FileText,
    title: "থিসিস ওয়ার্কস্পেস",
    description: "৮টি কাঠামোবদ্ধ সেকশনে খসড়া থেকে নিশ্চিত ও প্রকাশযোগ্য পরিকল্পনা তৈরি করুন।"
  },
  {
    icon: Handshake,
    title: "স্বচ্ছ টিমমেট ম্যাচিং",
    description: "স্কিল, ক্ষেত্র, আগ্রহ ও লোকেশন থেকে হিসাব করা ব্যাখ্যাযোগ্য স্কোর দিয়ে সঠিক মানুষ খুঁজুন।"
  }
];

export function FeaturePillars() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-primary">কীভাবে কাজ করে</p>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">ধারণা থেকে দল গঠন পর্যন্ত তিনটি ধাপ</h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 md:grid-cols-3"
      >
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.title}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              className="relative rounded-box border border-base-300 bg-base-100 p-6 shadow-sm transition-colors hover:border-primary/40 hover:shadow-md"
            >
              <span className="absolute right-5 top-5 text-3xl font-bold text-base-content/10">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-field bg-primary/10 text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-4 font-semibold">{pillar.title}</h3>
              <p className="mt-1.5 text-sm text-base-content/60">{pillar.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
