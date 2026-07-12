/**
 * Tipos del JSON fuente y de los datos ya normalizados que consume la UI.
 * El JSON es la única fuente de verdad: nada de esto contiene fechas,
 * nombres o estadísticas hardcodeadas, solo la forma de los datos.
 */

export interface ReglaGeneral {
  descripcion: string;
  tipo: string;
  alcance: string;
}

export interface FeriadoGeneral {
  fecha: string; // YYYY-MM-DD
  diaSemana: string;
  nombre: string;
  tipo: string;
  irrenunciable: boolean;
}

export type AlcanceEspecifico = "regional" | "comunal" | (string & {});

export interface FeriadoEspecifico {
  fecha: string; // YYYY-MM-DD
  diaSemana: string;
  nombre: string;
  tipo: string;
  alcance: AlcanceEspecifico;
  beneficiarios: string[];
}

export interface HolidaysData {
  pais: string;
  codigoPais?: string;
  locale?: string;
  anio: number;
  actualizado: string; // YYYY-MM-DD
  notas?: string;
  reglaGeneral?: ReglaGeneral;
  feriadosGenerales: FeriadoGeneral[];
  feriadosEspecificos: FeriadoEspecifico[];
}

/** Cobertura normalizada de un feriado, ya resuelta a un valor único. */
export type Cobertura = "nacional" | "regional" | "comunal";

/**
 * Forma unificada que usa toda la UI, combinando feriados generales y
 * específicos en una sola lista ordenable/filtrable.
 */
export interface Holiday {
  fecha: string; // YYYY-MM-DD
  date: Date; // medianoche local, derivado de `fecha`
  diaSemana: string;
  nombre: string;
  tipo: string;
  cobertura: Cobertura;
  irrenunciable: boolean;
  beneficiarios?: string[];
}
