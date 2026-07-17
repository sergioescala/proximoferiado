"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { BridgeList } from "@/components/BridgeList";
import { ControlsRow } from "@/components/ControlsRow";
import { formatDateRange, formatWeekday, startOfDay } from "@/lib/dates";
import { useHolidayData } from "@/hooks/useHolidayData";

function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

/**
 * Vista anual para planificar vacaciones: todos los fines de semana largos
 * y feriados puente del año (la data ya viene calculada y filtrada de
 * useHolidayData); acá solo se presenta.
 */
export function PlannerView() {
  const { now, data, longWeekends, bridgeOpportunities } = useHolidayData();
  const locale = data.locale ?? "es";

  if (!now || !longWeekends || !bridgeOpportunities) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold text-ink">Puentes y findes largos</h1>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl3" />
          ))}
        </div>
      </main>
    );
  }

  const today = startOfDay(now);
  const nextIndex = longWeekends.findIndex((lw) => lw.end.getTime() >= today.getTime());

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-6">
      <h1 className="text-2xl font-bold text-ink">Puentes y findes largos</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {plural(longWeekends.length, "fin de semana largo", "fines de semana largos")} y{" "}
        {plural(bridgeOpportunities.length, "puente")} en {data.anio}
      </p>

      <div className="mt-4">
        <ControlsRow />
      </div>

      <section className="mt-6" aria-label="Fines de semana largos">
        <h2 className="mb-3 text-sm font-semibold text-ink">Fines de semana largos</h2>
        {longWeekends.length === 0 ? (
          <Card className="animate-fade-up text-center">
            <p className="text-sm text-ink-muted">Este año no hay fines de semana largos con el filtro actual.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {longWeekends.map((lw, i) => {
              const isPast = lw.end.getTime() < today.getTime();
              const isNext = i === nextIndex;
              return (
                <Card
                  key={lw.start.toISOString()}
                  // animate-fade-up deja opacity:1 fijada (fill both), así que
                  // en tarjetas pasadas se cambia por el atenuado.
                  className={`p-4 ${isPast ? "opacity-60" : "animate-fade-up"} ${
                    isNext ? "border-accent/40 bg-gradient-to-br from-accent/[0.08] to-transparent" : ""
                  }`}
                >
                  {isNext ? (
                    <p className="mb-1 text-eyebrow font-semibold uppercase text-accent">Próximo</p>
                  ) : null}
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 text-base font-semibold text-ink">
                      {formatDateRange(lw.start, lw.end, locale)}
                    </p>
                    <Badge tone={isNext ? "accent" : "neutral"} className="shrink-0">
                      {lw.days} días
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatWeekday(lw.start, locale)} a {formatWeekday(lw.end, locale).toLowerCase()}
                  </p>
                  <p className="mt-1.5 text-2xs text-ink-faint">{lw.holidays.map((h) => h.nombre).join(" · ")}</p>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <div className="pb-4">
        <BridgeList opportunities={bridgeOpportunities} locale={locale} now={now} />
      </div>
    </main>
  );
}
