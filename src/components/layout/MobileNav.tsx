import { motion } from "framer-motion";
import { pages } from "../../config/navigation";
import { useNavigation } from "../../context/NavigationContext";

const visibleIds = ["onboarding", "consultant", "workspace", "matching", "profile"];

export function MobileNav() {
  const { page, goTo } = useNavigation();
  const visiblePages = pages.filter((item) => visibleIds.includes(item.id));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-base-300 bg-base-100/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {visiblePages.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => goTo(item.id)}
              className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                active ? "text-primary" : "text-base-content/55"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mobile-active"
                  className="absolute top-1.5 h-1 w-6 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={19} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
