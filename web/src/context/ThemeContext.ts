import { useState, useEffect, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";

type Theme = "light" | "dark";

function ThemeProviderImpl() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("diaryverse_theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ?? (prefersDark ? "dark" : "light");
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("diaryverse_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("diaryverse_theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  return { theme, toggleTheme, setTheme, isDark: theme === "dark" };
}

const [ThemeProvider, useTheme] = createContextHook(ThemeProviderImpl);

export { ThemeProvider, useTheme };
