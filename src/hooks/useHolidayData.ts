"use client";

import { useMemo } from "react";
import { useHolidayFilter } from "@/context/HolidayFilterContext";
import { useNow } from "@/hooks/useNow";
import { holidaysData } from "@/lib/data";
import { toKey } from "@/lib/dates";
import {
  getBridgeDayOpportunities,
  getLastHoliday,
  getLongWeekends,
  getNextHoliday,
  getTodayStatus,
  normalizeHolidays,
} from "@/lib/holidays";

/**
 * Punto de entrada único para toda la data derivada del JSON. `now` se
 * actualiza cada segundo (para el reloj), pero las estadísticas pesadas
 * solo se recalculan cuando cambia el día calendario (`todayKey`).
 *
 * Respeta el filtro global "solo nacionales / incluir regionales y
 * comunales": todo lo que devuelve este hook (próximo/último feriado,
 * timeline, calendario, fines de semana largos, puentes) ya viene filtrado.
 */
export function useHolidayData() {
  const now = useNow(1000);
  const { showNonNational } = useHolidayFilter();

  const allHolidays = useMemo(() => normalizeHolidays(holidaysData), []);
  const holidays = useMemo(
    () => (showNonNational ? allHolidays : allHolidays.filter((h) => h.cobertura === "nacional")),
    [allHolidays, showNonNational]
  );

  const todayKey = now ? toKey(now) : null;

  const derived = useMemo(() => {
    if (!now) return null;
    const todayStatus = getTodayStatus(holidays, now);
    const next = getNextHoliday(holidays, now);
    const last = getLastHoliday(holidays, now);
    const longWeekends = getLongWeekends(holidays, holidaysData.anio);
    const bridgeOpportunities = getBridgeDayOpportunities(holidays, holidaysData.anio);
    return { todayStatus, next, last, longWeekends, bridgeOpportunities };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey, holidays]);

  return { now, data: holidaysData, holidays, ...derived };
}
