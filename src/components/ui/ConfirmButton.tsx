import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ConfirmButtonProps {
  icon: LucideIcon;
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  className?: string;
}

export function ConfirmButton({ icon: Icon, label, confirmLabel, onConfirm, disabled, className = "" }: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(timer);
  }, [confirming]);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      onClick={(event) => {
        event.stopPropagation();
        if (confirming) {
          setConfirming(false);
          onConfirm();
        } else {
          setConfirming(true);
        }
      }}
      className={`btn btn-sm gap-1.5 ${confirming ? "btn-error" : "btn-ghost text-error"} ${className}`}
    >
      <Icon size={14} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={confirming ? "confirm" : "idle"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {confirming ? confirmLabel : label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
