import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountdownRing } from "@/components/dashboard/CountdownRing";
import { HolidayNatureNote } from "@/components/HolidayNatureNote";
import { diffInCalendarDays, formatDayMonth, formatWeekday } from "@/lib/dates";
import { getCountdownProgress, type BridgeOpportunity } from "@/lib/holidays";
import type { Holiday } from "@/types/holidays";

interface Props {
  holiday: Holiday | null;
  /** Último feriado ya ocurrido; ancla el inicio del anillo de progreso. */
  lastHoliday: Holiday | null;
  now: Date;
  locale: string;
  bridgeOpportunities: BridgeOpportunity[];
  className?: string;
}

export function NextHolidayHero({ holiday, lastHoliday, now, locale, bridgeOpportunities, className = "" }: Props) {
  if (!holiday) {
    return (
      <Card className={`animate-fade-up bg-gradient-to-br from-accent/[0.1] to-transparent text-center ${className}`}>
        <PartyPopper className="mx-auto h-10 w-10 text-accent" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-3 text-lg font-bold text-ink">¡Año completado!</p>
        <p className="mt-1 text-sm text-ink-muted">Ya pasaron todos los feriados de este año.</p>
        <Link
          href="/timeline"
          className="pressable mt-5 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink"
        >
          Ver la línea de tiempo
        </Link>
      </Card>
    );
  }

  const days = diffInCalendarDays(holiday.date, now);
  const hoursLeft = Math.max(1, Math.ceil((holiday.date.getTime() - now.getTime()) / 3_600_000));

  return (
    <Card
      className={`relative animate-fade-up overflow-hidden bg-gradient-to-br from-accent/[0.12] via-surface to-surface md:p-8 ${className}`}
    >
      <div className="flex items-center justify-between gap-5">
        <div className="min-w-0">
          <p className="text-eyebrow font-semibold uppercase text-accent">Próximo feriado</p>
          <h2 className="mt-1 text-2xl font-bold leading-tight text-ink md:text-3xl">{holiday.nombre}</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {formatWeekday(holiday.date, locale)}, {formatDayMonth(holiday.date, locale)}
          </p>
          {days === 1 ? (
            <p className="mt-1 text-2xs font-semibold text-accent">Es mañana · faltan {hoursLeft} horas</p>
          ) : null}

          <HolidayNatureNote
            holiday={holiday}
            bridgeOpportunities={bridgeOpportunities}
            locale={locale}
            className="mt-3"
          />
        </div>

        <CountdownRing
          progress={getCountdownProgress(lastHoliday, holiday, now)}
          days={days}
          label={days === 1 ? "día" : "días"}
        />
      </div>
    </Card>
  );
}
