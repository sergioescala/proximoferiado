"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-muted"
    >
      {/* El ícono puede diferir entre el HTML pre-generado (siempre asume
          claro) y el tema real leído en el navegador; es intencional. */}
      <span suppressHydrationWarning>{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</span>
    </button>
  );
}
