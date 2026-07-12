"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, History, House, type LucideIcon } from "lucide-react";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { href: "/", label: "Inicio", icon: House },
  { href: "/timeline", label: "Línea de tiempo", icon: History },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
];

function normalize(path: string): string {
  const stripped = path.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/85 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = normalize(pathname) === normalize(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-medium transition-all duration-200 active:scale-95 ${
                  active ? "text-accent" : "text-ink-faint hover:text-ink-muted"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
