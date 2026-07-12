import type { Cobertura, Holiday, HolidaysData } from "@/types/holidays";
import { addDays, diffInCalendarDays, isSameDay, parseISODate, startOfDay, toKey } from "@/lib/dates";

/** Une feriados generales y específicos en una sola lista, ordenada por fecha. */
export function normalizeHolidays(data: HolidaysData): Holiday[] {
  const generales: Holiday[] = data.feriadosGenerales.map((h) => ({
    fecha: h.fecha,
    date: parseISODate(h.fecha),
    diaSemana: h.diaSemana,
    nombre: h.nombre,
    tipo: h.tipo,
    cobertura: "nacional",
    irrenunciable: h.irrenunciable,
  }));

  const especificos: Holiday[] = data.feriadosEspecificos.map((h) => ({
    fecha: h.fecha,
    date: parseISODate(h.fecha),
    diaSemana: h.diaSemana,
    nombre: h.nombre,
    tipo: h.tipo,
    cobertura: (h.alcance as Cobertura) ?? "regional",
    irrenunciable: false,
    beneficiarios: h.beneficiarios,
  }));

  return [...generales, ...especificos].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export type TodayStatus =
  | { kind: "holiday"; holiday: Holiday }
  | { kind: "sunday" }
  | { kind: "workday" };

export function getTodayStatus(holidays: Holiday[], now: Date): TodayStatus {
  const today = startOfDay(now);
  const holidayToday = holidays.find((h) => isSameDay(h.date, today));
  if (holidayToday) return { kind: "holiday", holiday: holidayToday };
  if (today.getDay() === 0) return { kind: "sunday" };
  return { kind: "workday" };
}

export function getNextHoliday(holidays: Holiday[], now: Date): Holiday | null {
  const today = startOfDay(now);
  return holidays.find((h) => h.date.getTime() > today.getTime()) ?? null;
}

export function getLastHoliday(holidays: Holiday[], now: Date): Holiday | null {
  const today = startOfDay(now);
  const past = holidays.filter((h) => h.date.getTime() < today.getTime());
  return past.at(-1) ?? null;
}

export function describeCoverage(holiday: Holiday): string {
  if (holiday.cobertura === "nacional") return "Nacional";
  if (holiday.cobertura === "regional") return "Regional";
  if (holiday.cobertura === "comunal") return "Comunal";
  return holiday.cobertura;
}

export interface MonthCount {
  monthIndex: number;
  count: number;
}

export function getMonthlyDistribution(holidays: Holiday[]): MonthCount[] {
  const counts = Array.from({ length: 12 }, (_, monthIndex) => ({ monthIndex, count: 0 }));
  for (const h of holidays) counts[h.date.getMonth()]!.count += 1;
  return counts;
}

export interface WeekdayCount {
  weekdayIndex: number; // 0 = domingo ... 6 = sábado (convención de Date#getDay)
  count: number;
}

export function getWeekdayDistribution(holidays: Holiday[]): WeekdayCount[] {
  const counts = Array.from({ length: 7 }, (_, weekdayIndex) => ({ weekdayIndex, count: 0 }));
  for (const h of holidays) counts[h.date.getDay()]!.count += 1;
  return counts;
}

export interface GapInfo {
  days: number;
  from: Holiday;
  to: Holiday;
}

export interface GapsResult {
  max: GapInfo | null;
  min: GapInfo | null;
}

/** Mayor y menor intervalo (en días) entre feriados consecutivos del año. */
export function getGaps(holidays: Holiday[]): GapsResult {
  if (holidays.length < 2) return { max: null, min: null };
  let max: GapInfo | null = null;
  let min: GapInfo | null = null;
  for (let i = 1; i < holidays.length; i++) {
    const from = holidays[i - 1]!;
    const to = holidays[i]!;
    const days = diffInCalendarDays(to.date, from.date);
    if (days === 0) continue; // mismo día (ej. feriado nacional + regional coincidentes)
    if (!max || days > max.days) max = { days, from, to };
    if (!min || days < min.days) min = { days, from, to };
  }
  return { max, min };
}

export interface LongWeekend {
  start: Date;
  end: Date;
  days: number;
  holidays: Holiday[];
}

/**
 * Detecta "fines de semana largos": tramos de 3+ días consecutivos no
 * laborales (sábado, domingo o feriado) que incluyen al menos un feriado.
 * Asume la semana laboral estándar de lunes a viernes.
 */
export function getLongWeekends(holidays: Holiday[], year: number): LongWeekend[] {
  const holidaysByKey = new Map<string, Holiday[]>();
  for (const h of holidays) {
    const list = holidaysByKey.get(h.fecha) ?? [];
    list.push(h);
    holidaysByKey.set(h.fecha, list);
  }

  const rangeStart = new Date(year, 0, 1);
  const rangeEnd = new Date(year, 11, 31);
  const isNonWorking = (d: Date) => d.getDay() === 0 || d.getDay() === 6 || holidaysByKey.has(toKey(d));

  const runs: LongWeekend[] = [];
  let cursor = new Date(rangeStart);
  let currentStart: Date | null = null;
  let currentHolidays: Holiday[] = [];

  const flush = (end: Date) => {
    if (currentStart) {
      const days = diffInCalendarDays(end, currentStart) + 1;
      if (days >= 3 && currentHolidays.length > 0) {
        runs.push({ start: currentStart, end, days, holidays: currentHolidays });
      }
    }
    currentStart = null;
    currentHolidays = [];
  };

  while (cursor.getTime() <= rangeEnd.getTime()) {
    if (isNonWorking(cursor)) {
      if (!currentStart) currentStart = new Date(cursor);
      const todaysHolidays = holidaysByKey.get(toKey(cursor));
      if (todaysHolidays) currentHolidays.push(...todaysHolidays);
    } else {
      flush(addDays(cursor, -1));
    }
    cursor = addDays(cursor, 1);
  }
  flush(rangeEnd);

  return runs;
}

/** Domingos restantes desde `now` (inclusive) hasta el 31 de diciembre de `year`. */
export function getSundaysRemaining(now: Date, year: number): number {
  const today = startOfDay(now);
  const start = today.getFullYear() === year ? today : new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  if (start.getTime() > end.getTime()) return 0;

  let count = 0;
  let cursor = new Date(start);
  // Avanza al primer domingo.
  cursor = addDays(cursor, (7 - cursor.getDay()) % 7);
  while (cursor.getTime() <= end.getTime()) {
    count += 1;
    cursor = addDays(cursor, 7);
  }
  return count;
}

export interface HolidayStats {
  total: number;
  nacionales: number;
  regionales: number;
  comunales: number;
  restantes: number;
  transcurridos: number;
  irrenunciables: number;
  domingosRestantes: number;
  monthDistribution: MonthCount[];
  monthMost: MonthCount | null;
  monthLeast: MonthCount | null;
  weekdayDistribution: WeekdayCount[];
  gaps: GapsResult;
  longWeekends: LongWeekend[];
}

export function getHolidayStats(data: HolidaysData, holidays: Holiday[], now: Date): HolidayStats {
  const today = startOfDay(now);
  const nacionales = holidays.filter((h) => h.cobertura === "nacional").length;
  const regionales = holidays.filter((h) => h.cobertura === "regional").length;
  const comunales = holidays.filter((h) => h.cobertura === "comunal").length;
  const restantes = holidays.filter((h) => h.date.getTime() >= today.getTime()).length;
  const transcurridos = holidays.filter((h) => h.date.getTime() < today.getTime()).length;
  const irrenunciables = holidays.filter((h) => h.irrenunciable).length;

  const monthDistribution = getMonthlyDistribution(holidays);
  const monthsWithHolidays = monthDistribution.filter((m) => m.count > 0);
  const monthMost = monthsWithHolidays.reduce<MonthCount | null>(
    (best, m) => (!best || m.count > best.count ? m : best),
    null
  );
  const monthLeast = monthsWithHolidays.reduce<MonthCount | null>(
    (worst, m) => (!worst || m.count < worst.count ? m : worst),
    null
  );

  return {
    total: holidays.length,
    nacionales,
    regionales,
    comunales,
    restantes,
    transcurridos,
    irrenunciables,
    domingosRestantes: getSundaysRemaining(now, data.anio),
    monthDistribution,
    monthMost,
    monthLeast,
    weekdayDistribution: getWeekdayDistribution(holidays),
    gaps: getGaps(holidays),
    longWeekends: getLongWeekends(holidays, data.anio),
  };
}

export type TimelineState = "pasado" | "hoy" | "proximo" | "futuro";

export function getTimelineState(holiday: Holiday, now: Date, nextHoliday: Holiday | null): TimelineState {
  const today = startOfDay(now);
  if (isSameDay(holiday.date, today)) return "hoy";
  if (holiday.date.getTime() < today.getTime()) return "pasado";
  if (nextHoliday && isSameDay(holiday.date, nextHoliday.date)) return "proximo";
  return "futuro";
}
