import { formatDayMonth, formatWeekday, isWeekend } from "@/lib/dates";
import { findBridgeOpportunity, type BridgeOpportunity } from "@/lib/holidays";
import type { Holiday } from "@/types/holidays";

interface Props {
  holiday: Holiday;
  bridgeOpportunities: BridgeOpportunity[];
  locale: string;
  className?: string;
}

/**
 * Nota unificada sobre la "naturaleza" de un feriado puntual: si cae en fin
 * de semana (no suma un día libre extra) o si es un feriado puente (tomando
 * un solo día de vacaciones se estira el descanso). Se usa igual en Inicio,
 * Timeline y Calendario para no repetir el criterio en cada lugar.
 */
export function HolidayNatureNote({ holiday, bridgeOpportunities, locale, className = "" }: Props) {
  if (isWeekend(holiday.date)) {
    return <p className={`text-[10px] italic text-ink-faint ${className}`}>Cae en fin de semana</p>;
  }

  const bridge = findBridgeOpportunity(bridgeOpportunities, holiday);
  if (bridge) {
    return (
      <p className={`text-[10px] text-ink-faint ${className}`}>
        <span className="font-semibold text-accent">Feriado puente:</span> toma el{" "}
        {formatWeekday(bridge.bridgeDate, locale)} {formatDayMonth(bridge.bridgeDate, locale)} libre y súmalo a{" "}
        {bridge.totalDays} días seguidos.
      </p>
    );
  }

  return null;
}
