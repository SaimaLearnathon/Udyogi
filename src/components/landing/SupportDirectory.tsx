import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, HandCoins, Scale, Users } from "lucide-react";
import { staggerContainer, staggerItem } from "../../config/motion";
import type { supportOrganizations } from "../../data/demoData";

type SupportOrgs = typeof supportOrganizations;
type OrgType = SupportOrgs[number]["type"];

const tabs: { id: OrgType; label: string; icon: typeof HandCoins }[] = [
  { id: "funding", label: "ফান্ডিং", icon: HandCoins },
  { id: "legal", label: "আইনি সহায়তা", icon: Scale },
  { id: "mentorship", label: "মেন্টরশিপ", icon: Users }
];

export function SupportDirectory({ organizations }: { organizations: SupportOrgs }) {
  const [active, setActive] = useState<OrgType>("funding");
  const filtered = organizations.filter((org) => org.type === active);

  return (
    <section id="support" className="bg-base-100/60 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Building2 size={13} /> সহায়তা নেটওয়ার্ক
          </p>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">এনজিও, ফান্ড ও আইনি সহায়তা এক জায়গায়</h2>
          <p className="mt-2 max-w-xl text-sm text-base-content/60 md:text-base">
            আপনার স্টার্টআপের ধাপ অনুযায়ী উপযুক্ত সংস্থা, গ্রান্ট বা পরামর্শ খুঁজে নিন।
          </p>
        </motion.div>

        <div className="relative mb-6 inline-flex gap-1 rounded-field bg-base-200 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`relative z-10 flex items-center gap-1.5 rounded-field px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                  isActive ? "text-primary-content" : "text-base-content/60"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="support-tab"
                    className="absolute inset-0 -z-10 rounded-field bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <motion.div
          key={active}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((org) => (
            <motion.article
              key={org.id}
              variants={staggerItem}
              whileHover={{ y: -3 }}
              className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm transition-colors hover:border-primary/40 hover:shadow-md"
            >
              <h3 className="font-semibold">{org.name}</h3>
              <p className="mt-1.5 text-sm text-base-content/60">{org.description}</p>
              <span className="badge badge-outline badge-sm mt-3">{org.tag}</span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
