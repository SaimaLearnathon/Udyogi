import { AnimatePresence, motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useNavigation } from "../../context/NavigationContext";
import { pageVariants } from "../../config/motion";

const publicPages = new Set(["landing", "login", "register"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const { page } = useNavigation();

  if (publicPages.has(page)) {
    return (
      <div className="bg-mesh min-h-screen bg-base-200 text-base-content">
        <AnimatePresence mode="wait">
          <motion.div key={page} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-mesh min-h-screen bg-base-200 text-base-content">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-base-300 bg-base-100/80 px-4 py-3 backdrop-blur md:hidden">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-content">
                <Sprout size={15} />
              </span>
              <p className="text-base font-bold">উদ্যোগী</p>
            </div>
            <ThemeToggle />
          </header>
          <main className="min-w-0 flex-1 p-4 pb-24 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={page} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
