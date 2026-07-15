import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDayMonth, formatTime, formatWeekday } from "@/lib/dates";
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
}

export function TodayStatus({ now, status, locale }: Props) {
  if (!now || !status) {
    return (
      <div className="mx-5 mt-5">
        <Skeleton className="h-[88px] rounded-xl3" />
      </div>
    );
  }

  return (
    <div className="mx-5 mt-5 animate-fade-up rounded-xl3 border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {formatWeekday(now, locale)}, {formatDayMonth(now, locale)}
          </p>
          {/* El nodo que muta cada segundo va oculto para lectores de
              pantalla; el hermano sr-only da un ancla estable. */}
          <span className="sr-only">Hora actual</span>
          <time aria-hidden="true" className="mt-1 block text-[26px] font-bold leading-none tabular-nums text-ink">
            {formatTime(now, locale)}
          </time>
        </div>
        <StatusPill kind={status.kind} label={STATUS_LABEL[status.kind]} />
      </div>
    </div>
  );
}
