import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl3 border border-border bg-surface p-5 shadow-soft ${className}`}
      {...props}
    />
  );
}
