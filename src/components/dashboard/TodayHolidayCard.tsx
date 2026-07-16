import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HolidayNatureNote } from "@/components/HolidayNatureNote";
import { IrrenunciableNote } from "@/components/IrrenunciableNote";
import { formatFullDate } from "@/lib/dates";
import { describeCoverage, type BridgeOpportunity } from "@/lib/holidays";
import type { Holiday } from "@/types/holidays";

interface Props {
  holiday: Holiday;
  locale: string;
  notas?: string;
  bridgeOpportunities: BridgeOpportunity[];
  className?: string;
}

export function TodayHolidayCard({ holiday, locale, notas, bridgeOpportunities, className = "" }: Props) {
  const extra = holiday.beneficiarios?.length ? holiday.beneficiarios.join(", ") : notas;

  return (
    <Card className={`animate-fade-up border-holiday/25 bg-holiday/[0.06] ${className}`}>
      <p className="text-eyebrow font-semibold uppercase text-holiday">Feriado de hoy</p>
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
      <IrrenunciableNote irrenunciable={holiday.irrenunciable} className="mt-2" />
      <HolidayNatureNote
        holiday={holiday}
        bridgeOpportunities={bridgeOpportunities}
        locale={locale}
        className="mt-2"
      />
    </Card>
  );
}
