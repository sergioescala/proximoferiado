"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ControlsRow } from "@/components/ControlsRow";
import { HolidayNatureNote } from "@/components/HolidayNatureNote";
import { IrrenunciableNote } from "@/components/IrrenunciableNote";
import { MonthSummary } from "@/components/calendar/MonthSummary";
import { getMonthGrid, isCalendarMoveKey, moveFocusDate, type CalendarDay } from "@/lib/calendar";
import { formatFullDate, formatMonthName, parseISODate, toKey, weekdayNameByIndex } from "@/lib/dates";
import { describeCoverage, getMonthSummary, getTodayStatus } from "@/lib/holidays";
import { useHolidayData } from "@/hooks/useHolidayData";

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // lunes a domingo (convención Date#getDay)
const SWIPE_THRESHOLD_PX = 48;

function describeDayForScreenReader(day: CalendarDay, locale: string): string {
  const parts = [formatFullDate(day.date, locale)];
  if (day.isToday) parts.push("hoy");
  if (day.holidays.length > 0) parts.push(`feriado: ${day.holidays.map((h) => h.nombre).join(", ")}`);
  else if (day.isSunday) parts.push("domingo");
  if (!day.inMonth) parts.push("fuera del mes mostrado");
  return parts.join(", ");
}

export function CalendarView() {
  const { now, holidays, data, longWeekends, bridgeOpportunities } = useHolidayData();
  const locale = data.locale ?? "es";
  const [month, setMonth] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocusKey = useRef<string | null>(null);

  // Mueve el foco del DOM al día pedido por teclado una vez que la grilla
  // (posiblemente de otro mes) ya se renderizó.
  useEffect(() => {
    if (!pendingFocusKey.current) return;
    const el = dayRefs.current.get(pendingFocusKey.current);
    if (el) {
      el.focus();
      pendingFocusKey.current = null;
    }
  });

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

  const monthSummary = useMemo(() => {
    if (month === null || !longWeekends || !bridgeOpportunities) return null;
    return getMonthSummary(holidays, month, data.anio, longWeekends, bridgeOpportunities);
  }, [holidays, month, data.anio, longWeekends, bridgeOpportunities]);

  if (!now || month === null || !grid || !monthSummary) {
    return (
      <main className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold text-ink">Calendario</h1>
        <Skeleton className="mt-6 h-96 rounded-xl3" />
      </main>
    );
  }

  const weekdayLabels = WEEKDAY_ORDER.map((i) => weekdayNameByIndex(i, locale, "short"));
  const selectedStatus = selectedDay ? getTodayStatus(holidays, selectedDay.date) : null;

  const goToPreviousMonth = () => setMonth((m) => (m !== null ? Math.max(0, m - 1) : m));
  const goToNextMonth = () => setMonth((m) => (m !== null ? Math.min(11, m + 1) : m));

  // Roving tabindex: una sola celda es tabulable. Por defecto el día
  // enfocado por teclado; si no, hoy; si no, el 1 del mes mostrado.
  const focusableKey =
    (focusedKey && grid.some((day) => toKey(day.date) === focusedKey) ? focusedKey : null) ??
    grid.filter((day) => day.isToday && day.inMonth).map((day) => toKey(day.date))[0] ??
    toKey(grid.find((day) => day.inMonth)!.date);

  const focusDay = (date: Date) => {
    const key = toKey(date);
    pendingFocusKey.current = key;
    setFocusedKey(key);
    if (date.getMonth() !== month) setMonth(date.getMonth());
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "PageUp" || e.key === "PageDown") {
      // Mismo día del mes anterior/siguiente (recortado al largo del mes).
      const targetMonth = month + (e.key === "PageUp" ? -1 : 1);
      if (targetMonth < 0 || targetMonth > 11) return;
      e.preventDefault();
      const dayOfMonth = parseISODate(focusableKey).getDate();
      const daysInTarget = new Date(data.anio, targetMonth + 1, 0).getDate();
      focusDay(new Date(data.anio, targetMonth, Math.min(dayOfMonth, daysInTarget)));
      return;
    }
    if (!isCalendarMoveKey(e.key)) return;
    e.preventDefault();
    const next = moveFocusDate(parseISODate(focusableKey), e.key);
    if (next.getFullYear() !== data.anio) return;
    focusDay(next);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (deltaX > SWIPE_THRESHOLD_PX) goToPreviousMonth();
    else if (deltaX < -SWIPE_THRESHOLD_PX) goToNextMonth();
  };

  return (
    <main className="flex-1 px-5 pt-6">
      <h1 className="text-2xl font-bold text-ink">Calendario</h1>

      <div className="mt-4">
        <ControlsRow />
      </div>

      {/* En lg la grilla queda a la izquierda y el resumen + detalle del
          día pasan a un panel lateral fijo; en móvil todo fluye en columna. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
        <section aria-label="Grilla del mes">
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={month === 0}
              onClick={goToPreviousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink disabled:opacity-30 active:scale-95"
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
              onClick={goToNextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink disabled:opacity-30 active:scale-95"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div
            className="mt-4 grid grid-cols-7 gap-y-1 text-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleGridKeyDown}
          >
            {weekdayLabels.map((label, i) => (
              <span key={i} className="text-eyebrow font-semibold uppercase text-ink-faint">
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
                  ref={(el) => {
                    if (el) dayRefs.current.set(key, el);
                    else dayRefs.current.delete(key);
                  }}
                  tabIndex={key === focusableKey ? 0 : -1}
                  aria-label={describeDayForScreenReader(day, locale)}
                  aria-pressed={isSelected}
                  onFocus={() => setFocusedKey(key)}
                  onClick={() => setSelectedKey((prev) => (prev === key ? null : key))}
                  className={`relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-2xl text-sm transition-all active:scale-95 hover:bg-ink/[0.05] md:h-12 md:w-12 md:text-base ${
                    hasHoliday ? "font-semibold text-holiday" : day.isSunday ? "text-sunday" : "text-ink"
                  } ${hasHoliday ? "bg-holiday/[0.12]" : ""} ${!day.inMonth ? "opacity-40" : ""} ${
                    isSelected ? "bg-accent/[0.16] ring-2 ring-accent" : ""
                  } ${day.isToday ? "ring-2 ring-accent" : ""}`}
                >
                  {day.date.getDate()}
                  {hasHoliday ? (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-holiday" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-center text-2xs text-ink-faint md:hidden">Deslizá para cambiar de mes</p>

          <div className="mt-3 flex flex-wrap gap-3 text-2xs text-ink-faint">
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
        </section>

        <aside className="lg:sticky lg:top-8">
          <MonthSummary summary={monthSummary} locale={locale} />

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
                          <p className="mt-1.5 text-2xs text-ink-faint">{holiday.beneficiarios.join(", ")}</p>
                        ) : null}
                        <IrrenunciableNote irrenunciable={holiday.irrenunciable} className="mt-1" />
                        <HolidayNatureNote
                          holiday={holiday}
                          bridgeOpportunities={bridgeOpportunities ?? []}
                          locale={locale}
                          className="mt-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
