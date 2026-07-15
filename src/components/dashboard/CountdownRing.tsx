const SIZE = 112;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  /** Fracción recorrida (0–1) del tramo hacia el próximo feriado. */
  progress: number;
  days: number;
  label: string;
}

/**
 * Anillo SVG de progreso con la cuenta regresiva al centro: se va llenando
 * a medida que se acerca el próximo feriado. Solo CSS/SVG, sin dependencias.
 */
export function CountdownRing({ progress, days, label }: Props) {
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`Faltan ${days} ${label}`}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90" aria-hidden="true">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          className="stroke-border"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-accent"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="text-3xl font-black tabular-nums leading-none text-accent">{days}</span>
        <span className="mt-0.5 text-2xs font-medium text-ink-muted">{label}</span>
      </div>
    </div>
  );
}
