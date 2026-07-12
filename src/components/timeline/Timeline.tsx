"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { LocateFixed } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ControlsRow } from "@/components/ControlsRow";
import { HolidayNatureNote } from "@/components/HolidayNatureNote";
import { IrrenunciableNote } from "@/components/IrrenunciableNote";
import { diffInCalendarDays, formatDayMonth, formatMonthName, formatWeekday } from "@/lib/dates";
import { relativeDaysLabel } from "@/lib/format";
import { describeCoverage, getTimelineState, type TimelineState } from "@/lib/holidays";
import { useHolidayData } from "@/hooks/useHolidayData";
import type { Holiday } from "@/types/holidays";

const STATE_META: Record<TimelineState, { dot: string; label: string }> = {
  pasado: { dot: "bg-ink-faint/50", label: "Pasado" },
  hoy: { dot: "bg-holiday ring-4 ring-holiday/20", label: "Hoy" },
  proximo: { dot: "bg-accent ring-4 ring-accent/20", label: "Próximo" },
  futuro: { dot: "border-2 border-ink-faint/50 bg-surface", label: "Futuro" },
};

function itemKey(holiday: Holiday): string {
  return `${holiday.fecha}-${holiday.nombre}`;
}

function groupByMonth(holidays: Holiday[]): [number, Holiday[]][] {
  const map = new Map<number, Holiday[]>();
  for (const holiday of holidays) {
    const month = holiday.date.getMonth();
    const list = map.get(month) ?? [];
    list.push(holiday);
    map.set(month, list);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a - b);
}

export function Timeline() {
  const { now, holidays, next, data, bridgeOpportunities } = useHolidayData();
  const bridges = bridgeOpportunities ?? [];
  const locale = data.locale ?? "es";
  const groups = useMemo(() => groupByMonth(holidays), [holidays]);

  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const hasAutoScrolled = useRef(false);

  const scrollToNearest = useCallback(
    (behavior: ScrollBehavior) => {
      if (!now || holidays.length === 0) return;
      const target =
        holidays.find((h) => getTimelineState(h, now, next ?? null) === "hoy") ??
        holidays.find((h) => getTimelineState(h, now, next ?? null) === "proximo");
      if (!target) return;
      itemRefs.current.get(itemKey(target))?.scrollIntoView({ block: "center", behavior });
    },
    [now, holidays, next]
  );

  // Al entrar a la línea de tiempo, la posiciona directamente en el feriado
  // de hoy (o si no hay, en el próximo) para no tener que buscarlo a mano.
  // Se hace una sola vez: `now` cambia cada segundo y no debe reintentar.
  useEffect(() => {
    if (hasAutoScrolled.current || !now) return;
    hasAutoScrolled.current = true;
    scrollToNearest("auto");
  }, [now, scrollToNearest]);

  return (
    <main className="flex-1 px-5 pt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Línea de tiempo</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {holidays.length} feriados en {data.anio}
          </p>
        </div>
        <button
          type="button"
          aria-label="Ir al feriado de hoy o al próximo"
          onClick={() => scrollToNearest("smooth")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink-muted active:scale-95"
        >
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        <ControlsRow />
      </div>

      {!now ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl2" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-8 pb-4">
          {groups.map(([monthIndex, items]) => (
            <section key={monthIndex} className="animate-fade-up">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {formatMonthName(monthIndex, locale)}
              </h2>
              <ol className="relative border-l border-border pl-5">
                {items.map((holiday) => {
                  const state = getTimelineState(holiday, now, next ?? null);
                  const meta = STATE_META[state];
                  const days = diffInCalendarDays(holiday.date, now);

                  return (
                    <li
                      key={itemKey(holiday)}
                      ref={(el) => {
                        if (el) itemRefs.current.set(itemKey(holiday), el);
                        else itemRefs.current.delete(itemKey(holiday));
                      }}
                      className="relative scroll-mt-24 pb-6 last:pb-0"
                    >
                      <span
                        className={`absolute -left-[25px] top-1 h-3 w-3 rounded-full ${meta.dot}`}
                        aria-hidden="true"
                      />
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold leading-snug text-ink">{holiday.nombre}</p>
                          <p className="text-xs text-ink-muted">
                            {formatWeekday(holiday.date, locale)}, {formatDayMonth(holiday.date, locale)}
                          </p>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-ink-faint">
                          {relativeDaysLabel(days)}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge tone="neutral">{holiday.tipo}</Badge>
                        <Badge tone="accent">{describeCoverage(holiday)}</Badge>
                        {holiday.irrenunciable ? <Badge tone="workday">Irrenunciable</Badge> : null}
                      </div>
                      {holiday.beneficiarios?.length ? (
                        <p className="mt-1.5 text-[11px] text-ink-faint">{holiday.beneficiarios.join(", ")}</p>
                      ) : null}
                      <IrrenunciableNote irrenunciable={holiday.irrenunciable} className="mt-1" />
                      <HolidayNatureNote
                        holiday={holiday}
                        bridgeOpportunities={bridges}
                        locale={locale}
                        className="mt-1"
                      />
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
