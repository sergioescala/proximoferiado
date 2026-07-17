import type { MetadataRoute } from "next";

// Requerido por output:"export": sin esto, Next no sabe generar esta ruta
// como archivo estático en build time.
export const dynamic = "force-static";

// Ya incluye el basePath (ver .github/workflows/deploy.yml), así que no
// hace falta concatenarlo de nuevo acá. Si no está seteada (build local
// sin la variable), el sitemap queda vacío en vez de publicar URLs rotas.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];

  const routes = ["", "timeline", "calendar", "puentes"];
  return routes.map((route) => ({
    url: `${siteUrl}/${route ? `${route}/` : ""}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
  }));
}
