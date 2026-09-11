import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PageId } from "../config/navigation";

interface NavigationState {
  page: PageId;
  goTo: (page: PageId) => void;
}

const defaultPage: PageId = "onboarding";
const NavigationContext = createContext<NavigationState | null>(null);

function readPage(): PageId {
  return (window.location.hash.replace("#", "") || defaultPage) as PageId;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageId>(readPage);

  useEffect(() => {
    const onHashChange = () => setPage(readPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const value = useMemo(
    () => ({
      page,
      goTo(nextPage: PageId) {
        window.location.hash = nextPage;
        setPage(nextPage);
      }
    }),
    [page]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used inside NavigationProvider");
  return context;
}
