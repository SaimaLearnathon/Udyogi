import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "uddogi" | "uddogirat";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeState | null>(null);
const STORAGE_KEY = "uddogi_theme";

function readInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "uddogi" || stored === "uddogirat") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "uddogirat" : "uddogi";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeState>(
    () => ({
      theme,
      toggle: () => setTheme((current) => (current === "uddogi" ? "uddogirat" : "uddogi"))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
