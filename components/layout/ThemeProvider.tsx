"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ theme: "light" | "dark"; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(initial ? "dark" : "light"); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}