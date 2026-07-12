/**
 * Configuración pensada 100% para exportación estática (output: "export"),
 * compatible con GitHub Pages, Cloudflare Pages, Netlify, Firebase Hosting
 * y Vercel (static export). No usa SSR, ISR, API Routes, Middleware ni
 * ninguna feature que requiera un servidor Node en producción.
 *
 * NEXT_PUBLIC_BASE_PATH y NEXT_PUBLIC_SITE_URL se inyectan en CI (ver
 * .github/workflows/deploy.yml) con el nombre del repositorio y la URL
 * pública final, p.ej. basePath="/proximoferiado" y
 * siteUrl="https://usuario.github.io/proximoferiado", para que la app
 * funcione ahí y las URLs absolutas (metadata, sitemap) queden correctas.
 * En desarrollo o en un dominio propio / user.github.io raíz, basePath
 * queda vacío. NEXT_PUBLIC_SITE_URL es opcional: si no está seteada, se
 * omiten las URLs absolutas que la necesitan (sitemap) en vez de romper.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

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
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
