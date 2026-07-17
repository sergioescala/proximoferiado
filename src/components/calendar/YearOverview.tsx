import { getMonthGrid } from "@/lib/calendar";
import { formatMonthName, toKey } from "@/lib/dates";
import type { Holiday } from "@/types/holidays";

interface Props {
  year: number;
  holidays: Holiday[];
  now: Date;
  locale: string;
  onSelectMonth: (monthIndex: number) => void;
}

/**
 * Los 12 meses del año de un vistazo, con feriados y domingos marcados.
 * Cada mini-mes completo es un botón que lleva a la vista mensual; los
 * días no son interactivos a este nivel.
 */
export function YearOverview({ year, holidays, now, locale, onSelectMonth }: Props) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const grid = getMonthGrid(year, monthIndex, holidays, now);
        const holidayCount = grid.filter((day) => day.inMonth && day.holidays.length > 0).length;

        return (
          <button
            key={monthIndex}
            type="button"
            onClick={() => onSelectMonth(monthIndex)}
            aria-label={`Ver ${formatMonthName(monthIndex, locale)} de ${year}: ${holidayCount} ${
              holidayCount === 1 ? "feriado" : "feriados"
            }`}
            className="pressable animate-fade-up rounded-xl2 border border-border bg-surface p-3 text-left shadow-soft hover:border-accent/40"
          >
            <p className="flex items-baseline justify-between text-2xs font-semibold text-ink">
              {formatMonthName(monthIndex, locale)}
              {holidayCount > 0 ? (
                <span className="font-semibold text-holiday" aria-hidden="true">
                  {holidayCount}
                </span>
              ) : null}
            </p>
            <div className="mt-2 grid grid-cols-7 gap-y-0.5 text-center" aria-hidden="true">
              {grid.map((day) =>
                day.inMonth ? (
                  <span
                    key={toKey(day.date)}
                    className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-2xs tabular-nums ${
                      day.holidays.length > 0
                        ? "bg-holiday/[0.14] font-semibold text-holiday"
                        : day.isSunday
                          ? "text-sunday"
                          : "text-ink-muted"
                    } ${day.isToday ? "ring-1 ring-accent" : ""}`}
                  >
                    {day.date.getDate()}
                  </span>
                ) : (
                  <span key={toKey(day.date)} className="h-5 w-5" />
                )
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
