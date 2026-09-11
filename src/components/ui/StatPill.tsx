import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { staggerItem } from "../../config/motion";

export function StatPill({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -2 }}
      className="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3.5 shadow-sm transition-colors hover:border-primary/30"
    >
      {Icon && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-primary/10 text-primary">
          <Icon size={17} />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-base-content/55">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}
