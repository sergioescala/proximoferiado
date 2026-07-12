"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { HolidayFilterToggle } from "@/components/HolidayFilterToggle";
import { getMonthGrid } from "@/lib/calendar";
import { formatFullDate, formatMonthName, toKey, weekdayNameByIndex } from "@/lib/dates";
import { describeCoverage, getTodayStatus } from "@/lib/holidays";
import { useHolidayData } from "@/hooks/useHolidayData";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunes a domingo (convención Date#getDay)

export function CalendarView() {
  const { now, holidays, data } = useHolidayData();
  const locale = data.locale ?? "es";
  const [month, setMonth] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (month === null && now) {
      setMonth(now.getFullYear() === data.anio ? now.getMonth() : 0);
    }
  }, [now, month, data.anio]);

  const grid = useMemo(() => {
    if (!now || month === null) return null;
    return getMonthGrid(data.anio, month, holidays, now);
  }, [now, month, data.anio, holidays]);

  const selectedDay = useMemo(() => {
    if (!grid || !selectedKey) return null;
    return grid.find((d) => toKey(d.date) === selectedKey) ?? null;
  }, [grid, selectedKey]);

  if (!now || month === null || !grid) {
    return (
      <main className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold text-ink">Calendario</h1>
        <Skeleton className="mt-6 h-96 rounded-xl3" />
      </main>
    );
  }

  const weekdayLabels = WEEKDAY_ORDER.map((i) => weekdayNameByIndex(i, locale, "short"));
  const selectedStatus = selectedDay ? getTodayStatus(holidays, selectedDay.date) : null;

  return (
    <main className="flex-1 px-5 pt-6">
      <h1 className="text-2xl font-bold text-ink">Calendario</h1>

      <div className="mt-4">
        <HolidayFilterToggle />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={month === 0}
          onClick={() => setMonth((m) => (m !== null ? Math.max(0, m - 1) : m))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-base font-semibold text-ink">
          {formatMonthName(month, locale)} {data.anio}
        </p>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={month === 11}
          onClick={() => setMonth((m) => (m !== null ? Math.min(11, m + 1) : m))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink disabled:opacity-30 active:scale-95"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-y-1 text-center">
        {weekdayLabels.map((label, i) => (
          <span key={i} className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            {label}
          </span>
        ))}

        {grid.map((day) => {
          const key = toKey(day.date);
          const hasHoliday = day.holidays.length > 0;
          const isSelected = selectedKey === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedKey((prev) => (prev === key ? null : key))}
              className={`relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-2xl text-sm transition-all active:scale-95 ${
                hasHoliday ? "font-semibold text-holiday" : day.isSunday ? "text-sunday" : "text-ink"
              } ${hasHoliday ? "bg-holiday/[0.12]" : ""} ${!day.inMonth ? "opacity-40" : ""} ${
                isSelected ? "bg-accent/[0.16] ring-2 ring-accent" : ""
              } ${day.isToday ? "ring-2 ring-accent" : ""}`}
            >
              {day.date.getDate()}
              {hasHoliday ? <span className="absolute bottom-1 h-1 w-1 rounded-full bg-holiday" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full ring-2 ring-accent" /> Hoy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sunday" /> Domingo
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-holiday" /> Feriado
        </span>
      </div>

      <div className="mt-5 pb-4">
        {!selectedDay ? (
          <Card className="text-center">
            <p className="text-sm text-ink-muted">Toca un día para ver su detalle.</p>
          </Card>
        ) : (
          <Card className="animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              {formatFullDate(selectedDay.date, locale)}
            </p>

            {selectedDay.holidays.length === 0 ? (
              <p className="mt-2 text-sm text-ink-muted">
                {selectedStatus?.kind === "sunday" ? "Domingo — sin feriado adicional." : "Día laboral, sin feriado."}
              </p>
            ) : (
              <div className="mt-3 space-y-4">
                {selectedDay.holidays.map((holiday) => (
                  <div key={holiday.nombre}>
                    <p className="text-base font-semibold text-ink">{holiday.nombre}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="holiday">{holiday.tipo}</Badge>
                      <Badge tone="accent">{describeCoverage(holiday)}</Badge>
                      {holiday.irrenunciable ? <Badge tone="workday">Irrenunciable</Badge> : null}
                    </div>
                    {holiday.beneficiarios?.length ? (
                      <p className="mt-1.5 text-[11px] text-ink-faint">{holiday.beneficiarios.join(", ")}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}
