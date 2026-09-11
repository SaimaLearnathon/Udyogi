import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PageId } from "../config/navigation";

interface NavigationState {
  page: PageId;
  params: Record<string, string>;
  goTo: (page: PageId, params?: Record<string, string>) => void;
}

const defaultPage: PageId = "landing";
const NavigationContext = createContext<NavigationState | null>(null);

function readState(): { page: PageId; params: Record<string, string> } {
  const raw = window.location.hash.replace(/^#/, "");
  const [pagePart, queryPart] = raw.split("?");
  const params = Object.fromEntries(new URLSearchParams(queryPart ?? ""));
  return { page: (pagePart || defaultPage) as PageId, params };
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(readState);

  useEffect(() => {
    const onHashChange = () => setState(readState());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const value = useMemo<NavigationState>(
    () => ({
      page: state.page,
      params: state.params,
      goTo(nextPage, nextParams) {
        const query = nextParams && Object.keys(nextParams).length ? `?${new URLSearchParams(nextParams).toString()}` : "";
        window.location.hash = `${nextPage}${query}`;
        setState({ page: nextPage, params: nextParams ?? {} });
      }
    }),
    [state]
  );

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used inside NavigationProvider");
  return context;
}
