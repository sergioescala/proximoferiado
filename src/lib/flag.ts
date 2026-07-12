/** Convierte un código ISO 3166-1 alpha-2 (ej. "CL") en su emoji de bandera. */
export function countryCodeToFlagEmoji(code?: string): string {
  if (!code || code.length !== 2 || !/^[a-zA-Z]{2}$/.test(code)) return "🌎";
  const REGIONAL_INDICATOR_OFFSET = 127397;
  const codePoints = [...code.toUpperCase()].map((char) => char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET);
  return String.fromCodePoint(...codePoints);
}
