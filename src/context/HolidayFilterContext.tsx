"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "proximoferiado:incluir-no-nacionales";

interface HolidayFilterValue {
  /** Si es `false` (default), solo se consideran feriados de cobertura nacional. */
  showNonNational: boolean;
  setShowNonNational: (value: boolean) => void;
}

const HolidayFilterContext = createContext<HolidayFilterValue | null>(null);

export function HolidayFilterProvider({ children }: { children: ReactNode }) {
  const [showNonNational, setShowNonNationalState] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setShowNonNationalState(stored === "true");
  }, []);

  const setShowNonNational = (value: boolean) => {
    setShowNonNationalState(value);
    window.localStorage.setItem(STORAGE_KEY, String(value));
  };

  return (
    <HolidayFilterContext.Provider value={{ showNonNational, setShowNonNational }}>
      {children}
    </HolidayFilterContext.Provider>
  );
}

export function useHolidayFilter(): HolidayFilterValue {
  const ctx = useContext(HolidayFilterContext);
  if (!ctx) throw new Error("useHolidayFilter debe usarse dentro de <HolidayFilterProvider>");
  return ctx;
}
