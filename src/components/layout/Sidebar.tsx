import { LogOut, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import { navGroups } from "../../config/navigation";
import { useNavigation } from "../../context/NavigationContext";
import { useAuth } from "../../context/AuthContext";
import { usePendingRequestCount } from "../../hooks/usePendingRequestCount";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Sidebar() {
  const { page, goTo } = useNavigation();
  const { user, clearSession } = useAuth();
  const pendingRequestCount = usePendingRequestCount();

  function handleLogout() {
    clearSession();
    goTo("landing");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-base-300 bg-base-100 md:flex">
      <div className="flex items-center gap-2.5 px-5 pb-5 pt-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content">
          <Sprout size={19} />
        </span>
        <div>
          <p className="text-lg font-bold leading-tight">উদ্যোগী</p>
          <p className="text-xs text-base-content/55">ধারণা থেকে দল গঠন</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/40">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = page === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(item.id)}
                    className={`relative flex w-full items-center gap-3 rounded-field px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "text-primary-content" : "text-base-content/75 hover:bg-base-200 hover:text-base-content"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-field bg-primary"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon size={17} className="relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    {item.id === "messages" && pendingRequestCount > 0 && (
                      <span className="badge badge-error badge-sm relative z-10 ml-auto">{pendingRequestCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-base-300 p-3">
        <div className="flex items-center justify-between gap-2 rounded-field bg-base-200 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-content">
              {(user?.publicName ?? "অ")[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.publicName ?? "অতিথি"}</p>
              <p className="truncate text-xs text-base-content/50">{user ? "সাইন-ইন করা" : "ডেমো মোড"}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-field px-3 py-2 text-sm font-medium text-base-content/55 transition-colors hover:bg-base-200 hover:text-error"
        >
          <LogOut size={16} />
          লগআউট
        </button>
      </div>
    </aside>
  );
}
