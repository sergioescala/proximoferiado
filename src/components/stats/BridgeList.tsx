import { Footprints } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDayMonth, formatWeekday } from "@/lib/dates";
import type { BridgeOpportunity } from "@/lib/holidays";

export function BridgeList({ opportunities, locale }: { opportunities: BridgeOpportunity[]; locale: string }) {
  if (opportunities.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Footprints className="h-4 w-4 text-ink-faint" />
        Feriados puente
      </h2>
      <div className="space-y-3">
        {opportunities.map(({ holiday, bridgeDate, totalDays }) => (
          <Card key={holiday.fecha} className="animate-fade-up p-4">
            <p className="text-sm font-semibold text-ink">{holiday.nombre}</p>
            <p className="text-xs text-ink-muted">
              {formatWeekday(holiday.date, locale)}, {formatDayMonth(holiday.date, locale)}
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Tomando el{" "}
              <span className="font-medium text-ink">
                {formatWeekday(bridgeDate, locale)} {formatDayMonth(bridgeDate, locale)}
              </span>{" "}
              libre, sumas {totalDays} días seguidos.
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
