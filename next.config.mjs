/**
 * Configuración pensada 100% para exportación estática (output: "export"),
 * compatible con GitHub Pages, Cloudflare Pages, Netlify, Firebase Hosting
 * y Vercel (static export). No usa SSR, ISR, API Routes, Middleware ni
 * ninguna feature que requiera un servidor Node en producción.
 *
 * NEXT_PUBLIC_BASE_PATH se inyecta en CI (ver .github/workflows/deploy.yml)
 * con el nombre del repositorio, p.ej. "/proximoferiado", para que la app
 * funcione en https://usuario.github.io/proximoferiado/. En desarrollo o en
 * un dominio propio / user.github.io raíz, se deja vacío.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
