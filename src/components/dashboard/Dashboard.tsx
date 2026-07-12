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

      <TodayStatus now={now} status={todayStatus ?? null} locale={locale} />

      {todayStatus?.kind === "holiday" ? (
        <TodayHolidayCard
          holiday={todayStatus.holiday}
          locale={locale}
          notas={data.notas}
          bridgeOpportunities={bridges}
        />
      ) : null}

      {now ? (
        <NextHolidayHero holiday={next ?? null} now={now} locale={locale} bridgeOpportunities={bridges} />
      ) : (
        <div className="mx-5 mt-4">
          <Skeleton className="h-40 rounded-xl3" />
        </div>
      )}

      {now ? (
        <LastHolidayCard holiday={last ?? null} now={now} locale={locale} bridgeOpportunities={bridges} />
      ) : (
        <div className="mx-5 mt-4">
          <Skeleton className="h-20 rounded-xl3" />
        </div>
      )}
    </main>
  );
}
