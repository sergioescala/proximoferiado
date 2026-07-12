"use client";

import { useEffect, useState } from "react";

/**
 * Reloj reactivo. Devuelve `null` hasta que el componente se monta en el
 * navegador para evitar cualquier mismatch de hidratación: el HTML estático
 * generado en build time nunca puede saber la fecha/hora real del visitante.
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
