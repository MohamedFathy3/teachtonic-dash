import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, Lang, TranslationKey } from "@/i18n/translations";

type Theme = "light" | "dark";
type Role = "admin" | "instructor";

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  toggleTheme: () => void;
  role: Role;
  setRole: (r: Role) => void;
  t: (key: TranslationKey) => string;
  dir: "ltr" | "rtl";
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("lms-lang") as Lang) || "en");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("lms-theme") as Theme) || "light");
  const [role, setRoleState] = useState<Role>(() => (localStorage.getItem("lms-role") as Role) || "admin");

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("lms-lang", lang);
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("lms-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lms-role", role);
  }, [role]);

  const t = (key: TranslationKey) => translations[lang][key] || translations.en[key];

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang: setLangState,
        theme,
        toggleTheme: () => setTheme((p) => (p === "light" ? "dark" : "light")),
        role,
        setRole: setRoleState,
        t,
        dir,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
