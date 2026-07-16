"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { prefersReducedMotion } from "@/lib/dom";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => Promise<void>) => void;
};

/**
 * Navegación con la View Transitions API nativa: crossfade suave entre
 * pestañas donde el navegador la soporta, y push normal (sin costo) donde
 * no, o si la persona prefiere movimiento reducido.
 *
 * La promesa del callback se resuelve recién cuando React confirmó la nueva
 * ruta (cambio de pathname), para que el navegador capture el estado nuevo
 * correcto; el timeout es un resguardo para que la transición nunca quede
 * colgada si la navegación no cambia el pathname.
 */
export function useViewTransitionRouter(): (href: string) => void {
  const router = useRouter();
  const pathname = usePathname();
  const pendingResolve = useRef<(() => void) | null>(null);

  useEffect(() => {
    pendingResolve.current?.();
    pendingResolve.current = null;
  }, [pathname]);

  return useCallback(
    (href: string) => {
      const doc = document as DocumentWithViewTransition;
      if (!doc.startViewTransition || prefersReducedMotion()) {
        router.push(href);
        return;
      }
      doc.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            pendingResolve.current = resolve;
            router.push(href);
            setTimeout(resolve, 300);
          })
      );
    },
    [router]
  );
}
