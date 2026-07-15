import type { HTMLAttributes } from "react";

type Tone = "neutral" | "accent" | "holiday" | "sunday" | "workday";

const TONES: Record<Tone, string> = {
  neutral: "bg-ink/[0.06] text-ink-muted",
  accent: "bg-accent/[0.12] text-accent",
  holiday: "bg-holiday/[0.14] text-holiday",
  sunday: "bg-sunday/[0.14] text-sunday",
  workday: "bg-workday/[0.14] text-workday",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-semibold tracking-wide ${TONES[tone]} ${className}`}
      {...props}
    />
  );
}
