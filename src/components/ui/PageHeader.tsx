import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action
}: {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          {Icon && (
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon size={13} />
            </span>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">উদ্যোগী</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-base-content/65 md:text-base">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </motion.header>
  );
}
