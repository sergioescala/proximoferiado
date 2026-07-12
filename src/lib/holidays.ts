import type { Cobertura, Holiday, HolidaysData } from "@/types/holidays";
import { addDays, diffInCalendarDays, isSameDay, isWeekend, parseISODate, startOfDay, toKey } from "@/lib/dates";

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

/** Estado de un día cualquiera (no necesariamente "hoy"): feriado, domingo o laboral. */
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

export interface BridgeOpportunity {
  /** El feriado que cae lunes, martes, jueves o viernes. */
  holiday: Holiday;
  /** El día que habría que tomar como vacaciones para sumar más días libres. */
  bridgeDate: Date;
  /** Duración total del descanso resultante, en días. */
  totalDays: number;
}

/**
 * Desplazamiento (en días) hacia el día que conviene tomar como vacaciones,
 * según en qué día de la semana cae el feriado:
 * - Martes -> se puentea el lunes (-1) para sumar sábado+domingo+lunes+martes.
 * - Jueves -> se puentea el viernes (+1) para sumar jueves+viernes+sábado+domingo.
 * - Lunes -> ya viene pegado al fin de semana; se extiende con el martes (+1).
 * - Viernes -> ya viene pegado al fin de semana; se extiende con el jueves (-1).
 */
const BRIDGE_OFFSET_BY_WEEKDAY: Partial<Record<number, number>> = {
  1: 1, // lunes
  2: -1, // martes
  4: 1, // jueves
  5: -1, // viernes
};

/**
 * Detecta oportunidades de tomar un solo día de vacaciones para sumar más
 * días libres seguidos: feriados martes/jueves (se puentea el día que falta
 * para llegar al fin de semana) y feriados lunes/viernes (ya pegados al fin
 * de semana, se extienden un día más). Si el día a tomar ya es feriado, no
 * hace falta pedirlo, así que se descarta.
 */
export function getBridgeDayOpportunities(holidays: Holiday[], year: number): BridgeOpportunity[] {
  const holidayDates = new Set(holidays.map((h) => h.fecha));
  const opportunities: BridgeOpportunity[] = [];

  for (const holiday of holidays) {
    if (holiday.date.getFullYear() !== year) continue;
    const offset = BRIDGE_OFFSET_BY_WEEKDAY[holiday.date.getDay()];
    if (offset === undefined) continue;

    const bridgeDate = addDays(holiday.date, offset);
    if (holidayDates.has(toKey(bridgeDate))) continue; // ya es feriado, no hace falta pedirlo

    opportunities.push({ holiday, bridgeDate, totalDays: 4 });
  }

  return opportunities.sort((a, b) => a.holiday.date.getTime() - b.holiday.date.getTime());
}

/** Busca si un feriado puntual es, además, una oportunidad de puente. */
export function findBridgeOpportunity(
  opportunities: BridgeOpportunity[],
  holiday: Holiday
): BridgeOpportunity | undefined {
  return opportunities.find((o) => o.holiday.fecha === holiday.fecha && o.holiday.nombre === holiday.nombre);
}

export interface MonthSummary {
  monthIndex: number;
  /** Feriados de ese mes (nacionales + los específicos que apliquen según el filtro activo). */
  holidays: Holiday[];
  total: number;
  nacionales: number;
  regionales: number;
  comunales: number;
  /** Feriados de lunes a viernes: suman un día libre que no tendrías igual. */
  entreSemana: number;
  /** Feriados que caen sábado o domingo: no suman un día libre extra. */
  finDeSemana: number;
  /** Domingos del mes (independiente de si hay feriados). */
  domingos: number;
  longWeekends: LongWeekend[];
  bridgeOpportunities: BridgeOpportunity[];
}

/**
 * Recorte de la información del año a un único mes, para mostrarla junto al
 * calendario: solo lo que es relevante al navegar ese mes en particular.
 */
export function getMonthSummary(
  holidays: Holiday[],
  monthIndex: number,
  year: number,
  longWeekends: LongWeekend[],
  bridgeOpportunities: BridgeOpportunity[]
): MonthSummary {
  const monthHolidays = holidays.filter((h) => h.date.getMonth() === monthIndex && h.date.getFullYear() === year);
  const entreSemana = monthHolidays.filter((h) => !isWeekend(h.date)).length;

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let domingos = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    if (new Date(year, monthIndex, day).getDay() === 0) domingos += 1;
  }

  return {
    monthIndex,
    holidays: monthHolidays,
    total: monthHolidays.length,
    nacionales: monthHolidays.filter((h) => h.cobertura === "nacional").length,
    regionales: monthHolidays.filter((h) => h.cobertura === "regional").length,
    comunales: monthHolidays.filter((h) => h.cobertura === "comunal").length,
    entreSemana,
    finDeSemana: monthHolidays.length - entreSemana,
    domingos,
    longWeekends: longWeekends.filter((lw) => lw.start.getMonth() === monthIndex || lw.end.getMonth() === monthIndex),
    bridgeOpportunities: bridgeOpportunities.filter((o) => o.holiday.date.getMonth() === monthIndex),
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
