import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "hi" | "en";
type Prefs = { lang: Lang; largeText: boolean; highContrast: boolean; simple: boolean };
type Ctx = Prefs & {
  set: (p: Partial<Prefs>) => void;
  t: (hi: string, en: string) => string;
};
const DEFAULT: Prefs = { lang: "hi", largeText: false, highContrast: false, simple: false };
const PrefsContext = createContext<Ctx | null>(null);
const KEY = "sevasetu.prefs";

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      // Ignore malformed or unavailable storage and keep defaults.
    }
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    el.lang = prefs.lang;
    el.classList.toggle("large-text", prefs.largeText);
    el.classList.toggle("hc", prefs.highContrast);
  }, [prefs]);
  const set = (p: Partial<Prefs>) =>
    setPrefs((cur) => {
      const next = { ...cur, ...p };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Preferences still apply for this session even if storage is unavailable.
      }
      return next;
    });
  const t = (hi: string, en: string) => (prefs.lang === "hi" ? hi : en);
  return <PrefsContext.Provider value={{ ...prefs, set, t }}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const c = useContext(PrefsContext);
  if (!c) throw new Error("usePrefs outside PrefsProvider");
  return c;
}
