"use client";

import { Header } from "@/components/dashboard/Header";
import { LastHolidayCard } from "@/components/dashboard/LastHolidayCard";
import { NextHolidayHero } from "@/components/dashboard/NextHolidayHero";
import { TodayHolidayCard } from "@/components/dashboard/TodayHolidayCard";
import { TodayStatus } from "@/components/dashboard/TodayStatus";
import { ControlsRow } from "@/components/ControlsRow";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHolidayData } from "@/hooks/useHolidayData";

export function Dashboard() {
  const { now, data, todayStatus, next, last, bridgeOpportunities } = useHolidayData();
  const locale = data.locale ?? "es";
  const bridges = bridgeOpportunities ?? [];

  return (
    <main className="flex flex-1 flex-col pb-8">
      <Header data={data} />

      <div className="mt-3 px-5">
        <ControlsRow />
      </div>

      {/* En md+ el hero pasa arriba a lo ancho y las tarjetas menores se
          reparten en dos columnas; en móvil se conserva el orden de una
          columna (estado de hoy primero). */}
      <div className="mt-4 grid grid-cols-1 gap-4 px-5 md:grid-cols-2 md:gap-5">
        <TodayStatus now={now} status={todayStatus ?? null} locale={locale} className="md:order-2" />

        {todayStatus?.kind === "holiday" ? (
          <TodayHolidayCard
            holiday={todayStatus.holiday}
            locale={locale}
            notas={data.notas}
            bridgeOpportunities={bridges}
            className="md:order-3"
          />
        ) : null}

        {now ? (
          <NextHolidayHero
            holiday={next ?? null}
            lastHoliday={last ?? null}
            now={now}
            locale={locale}
            bridgeOpportunities={bridges}
            className="md:order-1 md:col-span-2"
          />
        ) : (
          <Skeleton className="h-40 rounded-xl3 md:order-1 md:col-span-2" />
        )}

        {now ? (
          <LastHolidayCard
            holiday={last ?? null}
            now={now}
            locale={locale}
            bridgeOpportunities={bridges}
            className="md:order-4"
          />
        ) : (
          <Skeleton className="h-20 rounded-xl3 md:order-4" />
        )}
      </div>
    </main>
  );
}
