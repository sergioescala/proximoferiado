import { Card } from "@/components/ui/Card";
import { diffInCalendarDays, formatDayMonth, formatWeekday } from "@/lib/dates";
import type { Holiday } from "@/types/holidays";

interface Props {
  holiday: Holiday | null;
  now: Date;
  locale: string;
}

export function LastHolidayCard({ holiday, now, locale }: Props) {
  if (!holiday) {
    return (
      <Card className="mx-5 mt-4 animate-fade-up">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Último feriado</p>
        <p className="mt-2 text-sm text-ink-muted">Todavía no ha ocurrido ningún feriado este año.</p>
      </Card>
    );
  }

  const days = Math.abs(diffInCalendarDays(now, holiday.date));

  return (
    <Card className="mx-5 mt-4 animate-fade-up">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Último feriado</p>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-ink">{holiday.nombre}</p>
          <p className="text-xs text-ink-muted">
            {formatWeekday(holiday.date, locale)}, {formatDayMonth(holiday.date, locale)}
          </p>
        </div>
        <p className="shrink-0 whitespace-nowrap text-xs font-medium text-ink-faint">
          hace {days} {days === 1 ? "día" : "días"}
        </p>
      </div>
    </Card>
  );
}
