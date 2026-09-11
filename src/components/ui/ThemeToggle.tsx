import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "uddogirat";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "লাইট মোডে যান" : "ডার্ক মোডে যান"}
      className={`relative flex h-9 w-16 items-center rounded-full border border-base-300 bg-base-200 px-1 transition-colors ${className}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-base-100 shadow-sm"
        style={{ marginLeft: isDark ? "auto" : 0 }}
      >
        {isDark ? <Moon size={14} className="text-primary" /> : <Sun size={14} className="text-secondary" />}
      </motion.span>
    </button>
  );
}
