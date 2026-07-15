import { Clock } from "@/components/dashboard/Clock";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDayMonth, formatWeekday } from "@/lib/dates";
import type { TodayStatus as TodayStatusValue } from "@/lib/holidays";

const STATUS_LABEL: Record<TodayStatusValue["kind"], string> = {
  holiday: "Hoy es feriado",
  sunday: "Hoy es domingo",
  workday: "Hoy es día laboral",
};

interface Props {
  now: Date | null;
  status: TodayStatusValue | null;
  locale: string;
  className?: string;
}

export function TodayStatus({ now, status, locale, className = "" }: Props) {
  if (!now || !status) {
    return <Skeleton className={`h-[88px] rounded-xl3 ${className}`} />;
  }

  return (
    <div className={`animate-fade-up rounded-xl3 border border-border bg-surface p-5 shadow-soft ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {formatWeekday(now, locale)}, {formatDayMonth(now, locale)}
          </p>
          {/* El nodo que muta cada segundo va oculto para lectores de
              pantalla; el hermano sr-only da un ancla estable. */}
          <span className="sr-only">Hora actual</span>
          <Clock locale={locale} />
        </div>
        <StatusPill kind={status.kind} label={STATUS_LABEL[status.kind]} />
      </div>
    </div>
  );
}
