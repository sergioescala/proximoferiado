"use client";

import { useHolidayFilter } from "@/context/HolidayFilterContext";

export function HolidayFilterToggle() {
  const { showNonNational, setShowNonNational } = useHolidayFilter();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={showNonNational}
      onClick={() => setShowNonNational(!showNonNational)}
      className="pressable flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-left text-2xs font-medium text-ink-muted"
    >
      <span
        className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${
          showNonNational ? "bg-accent" : "bg-ink/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
            showNonNational ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </span>
      Incluir regionales y comunales
    </button>
  );
}
