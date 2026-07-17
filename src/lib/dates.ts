/**
 * Utilidades de fecha "puras". Todo el cálculo de calendario vive acá para
 * que el resto de la app nunca manipule objetos Date a mano.
 *
 * Las fechas del JSON son strings "YYYY-MM-DD" sin hora ni zona horaria.
 * Siempre se parsean como medianoche en la zona horaria LOCAL del
 * dispositivo (no UTC), para evitar el clásico bug de "el feriado aparece
 * un día antes/después" según dónde esté el usuario.
 */

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

/** Diferencia en días de calendario completos entre dos medianoches locales. */
export function diffInCalendarDays(a: Date, b: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcA - utcB) / MS_PER_DAY);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function formatWeekday(date: Date, locale: string, style: "long" | "short" = "long"): string {
  return capitalize(new Intl.DateTimeFormat(locale, { weekday: style }).format(date));
}

export function formatMonthName(monthIndex: number, locale: string, style: "long" | "short" = "long"): string {
  const d = new Date(2000, monthIndex, 1);
  return capitalize(new Intl.DateTimeFormat(locale, { month: style }).format(d));
}

/** Nombre del día de semana a partir del índice de `Date#getDay` (0 = domingo). */
export function weekdayNameByIndex(index: number, locale: string, style: "long" | "short" = "long"): string {
  const reference = new Date(2023, 0, 1 + index); // 2023-01-01 fue domingo
  return formatWeekday(reference, locale, style);
}

export function formatDayMonth(date: Date, locale: string): string {
  return capitalize(new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(date));
}

/** Rango compacto tipo "14 – 16 de julio", capitalizado. */
export function formatDateRange(start: Date, end: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  try {
    return capitalize(formatter.formatRange(start, end));
  } catch {
    // Runtimes sin Intl.DateTimeFormat#formatRange (muy viejos).
    return `${formatDayMonth(start, locale)} – ${formatDayMonth(end, locale)}`;
  }
}

export function formatFullDate(date: Date, locale: string): string {
  return capitalize(
    new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
      date
    )
  );
}

export function formatTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

function capitalize(text: string): string {
  return text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
