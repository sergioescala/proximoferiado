import { Briefcase, PartyPopper, Sun, type LucideIcon } from "lucide-react";
import type { TodayStatus } from "@/lib/holidays";

const KIND_META: Record<TodayStatus["kind"], { icon: LucideIcon; className: string }> = {
  holiday: { icon: PartyPopper, className: "bg-holiday/[0.12] text-holiday" },
  sunday: { icon: Sun, className: "bg-sunday/[0.12] text-sunday" },
  workday: { icon: Briefcase, className: "bg-workday/[0.12] text-workday" },
};

interface Props {
  kind: TodayStatus["kind"];
  label: string;
}

/** Pill de estado del día (feriado/domingo/laboral) con ícono tonal. */
export function StatusPill({ kind, label }: Props) {
  const { icon: Icon, className } = KIND_META[kind];

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 ${className}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
      <span className="text-xs font-semibold">{label}</span>
    </span>
  );
}
