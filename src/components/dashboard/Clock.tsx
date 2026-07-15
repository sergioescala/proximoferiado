"use client";

import { useNow } from "@/hooks/useNow";
import { formatTime } from "@/lib/dates";

/**
 * Único consumidor del tick por segundo: mantiene el re-render de alta
 * frecuencia confinado a este nodo de texto en vez de propagarlo por toda
 * la página. El espacio duro evita el salto de layout del primer tick.
 */
export function Clock({ locale }: { locale: string }) {
  const now = useNow(1000);

  return (
    <time aria-hidden="true" className="mt-1 block whitespace-nowrap text-[26px] font-bold leading-none tabular-nums text-ink">
      {now ? formatTime(now, locale) : " "}
    </time>
  );
}
