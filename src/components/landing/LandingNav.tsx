import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sprout, X } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useNavigation } from "../../context/NavigationContext";

const anchors = [
  { href: "#nearby", label: "আশেপাশের উদ্যোক্তা" },
  { href: "#support", label: "সহায়তা ও ফান্ডিং" },
  { href: "#features", label: "ফিচার" }
];

export function LandingNav() {
  const { goTo } = useNavigation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-base-300/60 bg-base-100/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
            <Sprout size={18} />
          </span>
          <p className="text-lg font-bold">উদ্যোগী</p>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {anchors.map((anchor) => (
            <a key={anchor.href} href={anchor.href} className="text-sm font-medium text-base-content/65 hover:text-base-content">
              {anchor.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <button type="button" onClick={() => goTo("login")} className="btn btn-ghost btn-sm">
            লগইন
          </button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => goTo("register")}
            className="btn btn-primary btn-sm"
          >
            শুরু করুন
          </motion.button>
        </div>

        <button type="button" className="btn btn-ghost btn-sm btn-square md:hidden" onClick={() => setOpen((prev) => !prev)} aria-label="মেনু">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-base-300/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {anchors.map((anchor) => (
                <a
                  key={anchor.href}
                  href={anchor.href}
                  onClick={() => setOpen(false)}
                  className="rounded-field px-3 py-2 text-sm font-medium text-base-content/70 hover:bg-base-200"
                >
                  {anchor.label}
                </a>
              ))}
              <div className="mt-2 flex items-center gap-2 px-3">
                <button type="button" onClick={() => goTo("login")} className="btn btn-ghost btn-sm flex-1">
                  লগইন
                </button>
                <button type="button" onClick={() => goTo("register")} className="btn btn-primary btn-sm flex-1">
                  শুরু করুন
                </button>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
