import { Skeleton } from "@/components/ui/Skeleton";
import { formatDayMonth, formatTime, formatWeekday } from "@/lib/dates";
import type { TodayStatus as TodayStatusValue } from "@/lib/holidays";

const STATUS_META: Record<TodayStatusValue["kind"], { dot: string; label: string; tone: string }> = {
  holiday: { dot: "🟢", label: "Hoy es feriado", tone: "text-holiday" },
  sunday: { dot: "🟠", label: "Hoy es domingo", tone: "text-sunday" },
  workday: { dot: "⚪", label: "Hoy es día laboral", tone: "text-workday" },
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

  const meta = STATUS_META[status.kind];

  return (
    <div className="mx-5 mt-5 animate-fade-up rounded-xl3 border border-border bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            {formatWeekday(now, locale)}, {formatDayMonth(now, locale)}
          </p>
          <p className="mt-1 text-[26px] font-bold leading-none tabular-nums text-ink">{formatTime(now, locale)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-ink/[0.04] px-3 py-2">
          <span className="text-base leading-none">{meta.dot}</span>
          <span className={`text-xs font-semibold ${meta.tone}`}>{meta.label}</span>
        </div>
      </div>
    </div>
  );
}
