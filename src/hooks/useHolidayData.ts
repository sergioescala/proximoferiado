"use client";

import { useMemo } from "react";
import { useNow } from "@/hooks/useNow";
import { holidaysData } from "@/lib/data";
import { toKey } from "@/lib/dates";
import {
  getHolidayStats,
  getLastHoliday,
  getNextHoliday,
  getNextHolidayProgress,
  getTodayStatus,
  normalizeHolidays,
} from "@/lib/holidays";

/**
 * Punto de entrada único para toda la data derivada del JSON. `now` se
 * actualiza cada segundo (para el reloj), pero las estadísticas pesadas
 * solo se recalculan cuando cambia el día calendario (`todayKey`).
 */
export function useHolidayData() {
  const now = useNow(1000);
  const holidays = useMemo(() => normalizeHolidays(holidaysData), []);

  const todayKey = now ? toKey(now) : null;

  const derived = useMemo(() => {
    if (!now) return null;
    const todayStatus = getTodayStatus(holidays, now);
    const next = getNextHoliday(holidays, now);
    const last = getLastHoliday(holidays, now);
    const progress = next ? getNextHolidayProgress(last, next, now) : null;
    const stats = getHolidayStats(holidaysData, holidays, now);
    return { todayStatus, next, last, progress, stats };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey, holidays]);

  return { now, data: holidaysData, holidays, ...derived };
}
