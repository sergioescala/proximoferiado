import type { HolidayStats } from "@/lib/holidays";
import { formatMonthName, weekdayNameByIndex } from "@/lib/dates";

export interface StatItem {
  id: string;
  label: string;
  value: string;
  caption?: string;
}

function pluralDias(n: number): string {
  return `${n} ${n === 1 ? "día" : "días"}`;
}

function pluralFeriados(n: number): string {
  return `${n} ${n === 1 ? "feriado" : "feriados"}`;
}

/**
 * Traduce el `HolidayStats` (calculado 100% desde el JSON) a una lista de
 * tarjetas listas para pintar. Ningún texto acá contiene una fecha o un
 * nombre de feriado fijo: todo sale de `stats`.
 */
export function buildStatItems(stats: HolidayStats, locale: string): StatItem[] {
  const countByWeekday = (index: number) =>
    stats.weekdayDistribution.find((w) => w.weekdayIndex === index)?.count ?? 0;

  return [
    { id: "total", label: "Feriados totales", value: String(stats.total) },
    { id: "nacionales", label: "Nacionales", value: String(stats.nacionales) },
    { id: "regionales", label: "Regionales", value: String(stats.regionales) },
    { id: "comunales", label: "Comunales", value: String(stats.comunales) },
    { id: "restantes", label: "Restantes", value: String(stats.restantes) },
    { id: "transcurridos", label: "Transcurridos", value: String(stats.transcurridos) },
    { id: "irrenunciables", label: "Irrenunciables", value: String(stats.irrenunciables) },
    { id: "domingos", label: "Domingos restantes", value: String(stats.domingosRestantes) },
    {
      id: "mesMax",
      label: "Mes con más feriados",
      value: stats.monthMost ? formatMonthName(stats.monthMost.monthIndex, locale) : "—",
      caption: stats.monthMost ? pluralFeriados(stats.monthMost.count) : undefined,
    },
    {
      id: "mesMin",
      label: "Mes con menos feriados",
      value: stats.monthLeast ? formatMonthName(stats.monthLeast.monthIndex, locale) : "—",
      caption: stats.monthLeast ? pluralFeriados(stats.monthLeast.count) : undefined,
    },
    {
      id: "gapMax",
      label: "Mayor intervalo sin feriados",
      value: stats.gaps.max ? pluralDias(stats.gaps.max.days) : "—",
      caption: stats.gaps.max ? `Entre ${stats.gaps.max.from.nombre} y ${stats.gaps.max.to.nombre}` : undefined,
    },
    {
      id: "gapMin",
      label: "Menor intervalo entre feriados",
      value: stats.gaps.min ? pluralDias(stats.gaps.min.days) : "—",
      caption: stats.gaps.min ? `Entre ${stats.gaps.min.from.nombre} y ${stats.gaps.min.to.nombre}` : undefined,
    },
    { id: "finesLargos", label: "Fines de semana largos", value: String(stats.longWeekends.length) },
    {
      id: "lunes",
      label: `Feriados que caen ${weekdayNameByIndex(1, locale).toLowerCase()}`,
      value: String(countByWeekday(1)),
    },
    {
      id: "viernes",
      label: `Feriados que caen ${weekdayNameByIndex(5, locale).toLowerCase()}`,
      value: String(countByWeekday(5)),
    },
    {
      id: "sabado",
      label: `Feriados que caen ${weekdayNameByIndex(6, locale).toLowerCase()}`,
      value: String(countByWeekday(6)),
    },
    {
      id: "domingo",
      label: `Feriados que caen ${weekdayNameByIndex(0, locale).toLowerCase()}`,
      value: String(countByWeekday(0)),
    },
  ];
}
