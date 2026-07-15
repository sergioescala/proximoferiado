import { Briefcase, CalendarDays, PartyPopper, Sun } from "lucide-react";
import { BridgeList } from "@/components/BridgeList";
import { Card } from "@/components/ui/Card";
import type { MonthSummary as MonthSummaryData } from "@/lib/holidays";

function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

interface Props {
  summary: MonthSummaryData;
  locale: string;
}

/**
 * Resumen acotado al mes que se está viendo en el calendario: al navegar
 * entre meses, esta sección cambia con ellos en vez de mostrar cifras del
 * año completo.
 */
export function MonthSummary({ summary, locale }: Props) {
  if (summary.total === 0) {
    return (
      <Card className="mt-5 animate-fade-up text-center">
        <p className="text-sm text-ink-muted">Sin feriados este mes.</p>
        <p className="mt-1 text-xs text-ink-faint">{plural(summary.domingos, "domingo")}</p>
      </Card>
    );
  }

  const coverageCaption =
    summary.regionales + summary.comunales > 0
      ? `${summary.nacionales} nac., ${summary.regionales} reg., ${summary.comunales} com.`
      : undefined;

  const tiles = [
    { icon: CalendarDays, value: summary.total, label: "Feriados este mes", caption: coverageCaption },
    {
      icon: Briefcase,
      value: summary.entreSemana,
      label: "Entre semana",
      caption: summary.finDeSemana > 0 ? `${summary.finDeSemana} en fin de semana` : undefined,
    },
    { icon: Sun, value: summary.domingos, label: "Domingos" },
    { icon: PartyPopper, value: summary.longWeekends.length, label: "Fines de semana largos" },
  ];

  return (
    <div className="mt-5">
      <h2 className="mb-3 text-sm font-semibold text-ink">Resumen del mes</h2>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Card key={tile.label} className="animate-fade-up p-4">
            <tile.icon className="h-4 w-4 text-ink-faint" strokeWidth={2} />
            <p className="mt-2 text-xl font-bold leading-none text-ink">{tile.value}</p>
            <p className="mt-1.5 text-2xs leading-snug text-ink-muted">{tile.label}</p>
            {tile.caption ? <p className="mt-1 text-2xs leading-snug text-ink-faint">{tile.caption}</p> : null}
          </Card>
        ))}
      </div>
      <BridgeList opportunities={summary.bridgeOpportunities} locale={locale} />
    </div>
  );
}
