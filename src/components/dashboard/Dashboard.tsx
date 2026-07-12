"use client";

import { Header } from "@/components/dashboard/Header";
import { LastHolidayCard } from "@/components/dashboard/LastHolidayCard";
import { NextHolidayHero } from "@/components/dashboard/NextHolidayHero";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TodayHolidayCard } from "@/components/dashboard/TodayHolidayCard";
import { TodayStatus } from "@/components/dashboard/TodayStatus";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHolidayData } from "@/hooks/useHolidayData";

export function Dashboard() {
  const { now, data, todayStatus, next, last, progress, stats } = useHolidayData();
  const locale = data.locale ?? "es";

  return (
    <main className="flex flex-1 flex-col pb-8">
      <Header data={data} />

      <TodayStatus now={now} status={todayStatus ?? null} locale={locale} />

      {todayStatus?.kind === "holiday" ? (
        <TodayHolidayCard holiday={todayStatus.holiday} locale={locale} notas={data.notas} />
      ) : null}

      {now ? (
        <NextHolidayHero holiday={next ?? null} now={now} progress={progress ?? null} locale={locale} />
      ) : (
        <div className="mx-5 mt-4">
          <Skeleton className="h-52 rounded-xl3" />
        </div>
      )}

      {now ? (
        <LastHolidayCard holiday={last ?? null} now={now} locale={locale} />
      ) : (
        <div className="mx-5 mt-4">
          <Skeleton className="h-20 rounded-xl3" />
        </div>
      )}

      {stats ? (
        <StatsGrid stats={stats} locale={locale} />
      ) : (
        <div className="mx-5 mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl3" />
          ))}
        </div>
      )}
    </main>
  );
}
