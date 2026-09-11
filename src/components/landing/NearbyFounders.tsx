import { motion } from "framer-motion";
import { MapPin, Radar } from "lucide-react";
import { staggerContainer, staggerItem } from "../../config/motion";
import type { nearbyFounders } from "../../data/demoData";

export function NearbyFounders({ founders }: { founders: typeof nearbyFounders }) {
  return (
    <section id="nearby" className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Radar size={13} /> লোকাল নেটওয়ার্ক
          </p>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">আপনার আশেপাশে উদ্যোক্তারা কী করছেন</h2>
          <p className="mt-2 max-w-xl text-sm text-base-content/60 md:text-base">
            একই এলাকায় সক্রিয় প্রতিষ্ঠাতাদের ধারণা দেখুন, সংযোগ করুন এবং সম্ভাব্য সহ-প্রতিষ্ঠাতা খুঁজুন।
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {founders.map((founder) => (
          <motion.article
            key={founder.id}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm transition-colors hover:border-primary/40 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {founder.name[0]}
              </span>
              <span className="badge badge-outline badge-sm">{founder.field}</span>
            </div>
            <p className="font-semibold">{founder.name}</p>
            <p className="mt-1 text-sm text-base-content/60">{founder.idea}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-base-content/45">
              <MapPin size={12} />
              {founder.location} · ~{founder.distanceKm} কিমি দূরে
            </p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
