/** Frase relativa en español a partir de una diferencia de días de calendario. */
export function relativeDaysLabel(days: number): string {
  if (days === 0) return "Hoy";
  if (days > 0) return `En ${days} ${days === 1 ? "día" : "días"}`;
  const abs = Math.abs(days);
  return `Hace ${abs} ${abs === 1 ? "día" : "días"}`;
}
