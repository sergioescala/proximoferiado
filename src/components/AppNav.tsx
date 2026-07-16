"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, History, House, type LucideIcon } from "lucide-react";
import { holidaysData } from "@/lib/data";
import { countryCodeToFlagEmoji } from "@/lib/flag";
import { useViewTransitionRouter } from "@/hooks/useViewTransitionRouter";

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

/**
 * Navegación principal única: barra inferior en móvil/tablet y rail lateral
 * fijo en pantallas lg+. Un solo componente, sin detección en JS.
 */
export function AppNav() {
  const pathname = usePathname() ?? "/";
  const pushWithTransition = useViewTransitionRouter();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/85 pb-safe-b backdrop-blur-xl lg:inset-x-auto lg:left-0 lg:top-0 lg:w-60 lg:border-r lg:border-t-0 lg:bg-surface lg:pb-0"
      aria-label="Navegación principal"
    >
      <div className="hidden items-center gap-2.5 px-6 pt-7 lg:flex">
        <span className="text-2xl leading-none" role="img" aria-label={holidaysData.pais}>
          {countryCodeToFlagEmoji(holidaysData.codigoPais)}
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight text-ink">Próximo feriado</p>
          <p className="text-2xs leading-tight text-ink-faint">
            {holidaysData.pais} · {holidaysData.anio}
          </p>
        </div>
      </div>

      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5 lg:mx-0 lg:max-w-none lg:flex-col lg:justify-start lg:gap-1 lg:px-3 lg:pt-6">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = normalize(pathname) === normalize(href);
          return (
            <li key={href} className="flex-1 lg:flex-none">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  // Deja pasar aperturas en otra pestaña (cmd/ctrl/shift/click central).
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  pushWithTransition(href);
                }}
                className={`pressable flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1.5 text-2xs font-medium lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-xl lg:px-4 lg:py-2.5 lg:text-sm ${
                  active ? "text-accent lg:bg-accent/[0.1]" : "text-ink-faint hover:text-ink-muted"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
                <span
                  className={`h-1 w-1 rounded-full ${active ? "animate-fade-in bg-accent" : "bg-transparent"} lg:hidden`}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
