import { addDays, isSameDay, startOfDay, toKey } from "@/lib/dates";
import type { Holiday } from "@/types/holidays";

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  isSunday: boolean;
  holidays: Holiday[];
}

/** Índice de día de semana con la semana empezando en lunes (0 = lunes). */
function mondayFirstIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export type CalendarMoveKey = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" | "Home" | "End";

export function isCalendarMoveKey(key: string): key is CalendarMoveKey {
  return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(key);
}

/**
 * Día al que se mueve el foco en la grilla según la tecla presionada
 * (patrón ARIA de grilla de calendario). Home/End van al lunes/domingo de
 * la misma semana. Puede cruzar de mes; quien llama decide si seguirlo.
 */
export function moveFocusDate(date: Date, key: CalendarMoveKey): Date {
  switch (key) {
    case "ArrowLeft":
      return addDays(date, -1);
    case "ArrowRight":
      return addDays(date, 1);
    case "ArrowUp":
      return addDays(date, -7);
    case "ArrowDown":
      return addDays(date, 7);
    case "Home":
      return addDays(date, -mondayFirstIndex(date));
    case "End":
      return addDays(date, 6 - mondayFirstIndex(date));
  }
}

/** Genera la grilla de un mes (siempre en semanas completas, lunes a domingo). */
export function getMonthGrid(year: number, monthIndex: number, holidays: Holiday[], now: Date): CalendarDay[] {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leadingOffset = mondayFirstIndex(firstOfMonth);
  const totalCells = Math.ceil((leadingOffset + daysInMonth) / 7) * 7;
  const gridStart = addDays(firstOfMonth, -leadingOffset);
  const today = startOfDay(now);

  const holidaysByKey = new Map<string, Holiday[]>();
  for (const holiday of holidays) {
    const list = holidaysByKey.get(holiday.fecha) ?? [];
    list.push(holiday);
    holidaysByKey.set(holiday.fecha, list);
  }

  return Array.from({ length: totalCells }, (_, i) => {
    const date = addDays(gridStart, i);
    return {
      date,
      inMonth: date.getMonth() === monthIndex,
      isToday: isSameDay(date, today),
      isSunday: date.getDay() === 0,
      holidays: holidaysByKey.get(toKey(date)) ?? [],
    };
  });
}
