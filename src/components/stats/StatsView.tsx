"use client";

import { BridgeList } from "@/components/stats/BridgeList";
import { StatsGrid } from "@/components/stats/StatsGrid";
import { ControlsRow } from "@/components/ControlsRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHolidayData } from "@/hooks/useHolidayData";

export function StatsView() {
  const { data, stats } = useHolidayData();
  const locale = data.locale ?? "es";

  return (
    <main className="flex-1 px-5 pt-6">
      <h1 className="text-2xl font-bold text-ink">Resumen del año</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {data.pais} · {data.anio}
      </p>

      <div className="mt-4">
        <ControlsRow />
      </div>

      <div className="mt-6 pb-4">
        {stats ? (
          <>
            <StatsGrid stats={stats} locale={locale} />
            <BridgeList opportunities={stats.bridgeOpportunities} locale={locale} />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl3" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
