import raw from "../../data/feriados-chile-2026.json";
import type { HolidaysData } from "@/types/holidays";

/**
 * Única fuente de datos de toda la aplicación. Se importa de forma estática
 * (compilada en el bundle en build time), por lo que no depende de ningún
 * fetch en runtime ni de configuración de basePath: funciona igual en
 * desarrollo y en cualquier hosting estático.
 *
 * Para servir otro país/año basta con reemplazar el contenido de
 * data/feriados-<pais>-<anio>.json (mismo esquema) y actualizar este import.
 */
export const holidaysData = raw as unknown as HolidaysData;
