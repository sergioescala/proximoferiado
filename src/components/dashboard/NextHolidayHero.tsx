import { Card } from "@/components/ui/Card";
import { HolidayNatureNote } from "@/components/HolidayNatureNote";
import { diffInCalendarDays, formatDayMonth, formatWeekday } from "@/lib/dates";
import type { BridgeOpportunity } from "@/lib/holidays";
import type { Holiday } from "@/types/holidays";

interface Props {
  holiday: Holiday | null;
  now: Date;
  locale: string;
  bridgeOpportunities: BridgeOpportunity[];
  className?: string;
}

export function NextHolidayHero({ holiday, now, locale, bridgeOpportunities, className = "" }: Props) {
  if (!holiday) {
    return (
      <Card className={`animate-fade-up bg-gradient-to-br from-accent/[0.1] to-transparent text-center ${className}`}>
        <p className="text-sm font-medium text-ink-muted">No quedan más feriados por delante este año. 🎉</p>
      </Card>
    );
  }

  const days = diffInCalendarDays(holiday.date, now);

  return (
    <Card
      className={`relative animate-fade-up overflow-hidden bg-gradient-to-br from-accent/[0.12] via-surface to-surface md:p-8 ${className}`}
    >
      <p className="text-eyebrow font-semibold uppercase text-accent">Próximo feriado</p>
      <h2 className="mt-1 text-2xl font-bold leading-tight text-ink">{holiday.nombre}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        {formatWeekday(holiday.date, locale)}, {formatDayMonth(holiday.date, locale)}
      </p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-5xl font-black tabular-nums leading-none text-accent md:text-6xl">{days}</span>
        <span className="text-sm font-medium text-ink-muted">{days === 1 ? "día" : "días"}</span>
      </div>

      <HolidayNatureNote
        holiday={holiday}
        bridgeOpportunities={bridgeOpportunities}
        locale={locale}
        className="mt-3"
      />
    </Card>
  );
}
