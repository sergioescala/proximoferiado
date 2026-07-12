import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatFullDate } from "@/lib/dates";
import { describeCoverage } from "@/lib/holidays";
import type { Holiday } from "@/types/holidays";

interface Props {
  holiday: Holiday;
  locale: string;
  notas?: string;
}

export function TodayHolidayCard({ holiday, locale, notas }: Props) {
  const extra = holiday.beneficiarios?.length ? holiday.beneficiarios.join(", ") : notas;

  return (
    <Card className="mx-5 mt-4 animate-fade-up border-holiday/25 bg-holiday/[0.06]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-holiday">Feriado de hoy</p>
      <h2 className="mt-1 text-xl font-bold leading-tight text-ink">{holiday.nombre}</h2>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="holiday">{holiday.tipo}</Badge>
        <Badge tone="accent">{describeCoverage(holiday)}</Badge>
        <Badge tone={holiday.irrenunciable ? "workday" : "neutral"}>
          {holiday.irrenunciable ? "Irrenunciable" : "No irrenunciable"}
        </Badge>
      </div>

      <p className="mt-3 text-sm text-ink-muted">{formatFullDate(holiday.date, locale)}</p>
      {extra ? <p className="mt-2 text-xs leading-relaxed text-ink-faint">{extra}</p> : null}
    </Card>
  );
}
