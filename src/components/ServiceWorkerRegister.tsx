"use client";

import { useEffect } from "react";

/**
 * Registra el service worker relativo al basePath real del deploy, para
 * que funcione tanto en la raíz de un dominio propio como en
 * https://usuario.github.io/repositorio/.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const scope = `${basePath}/`;
    const swUrl = `${basePath}/sw.js`;

    navigator.serviceWorker.register(swUrl, { scope }).catch(() => undefined);
  }, []);

  return null;
}
