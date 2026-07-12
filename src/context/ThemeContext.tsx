"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "proximoferiado:tema";

interface ThemeValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function readInitialTheme(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // El script inline en <head> (ver layout.tsx) ya aplicó el tema correcto
  // al <html> antes de la primera pintura. El inicializador lee ese mismo
  // atributo (solo existe en el navegador, nunca durante el build estático)
  // para que el ícono del toggle nazca ya correcto y no parpadee.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    const domTheme = document.documentElement.dataset.theme;
    return domTheme === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    setThemeState(readInitialTheme());
  }, []);

  const setTheme = (value: Theme) => {
    setThemeState(value);
    applyTheme(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}
