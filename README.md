# proximoferiado

Aplicación web mobile-first para explorar, calcular y visualizar los feriados
oficiales de un país. Toda la información sale de un único archivo JSON:
nada de fechas, nombres o estadísticas está hardcodeado en el código, todo
se calcula dinámicamente en el navegador.

**100% exportación estática (`output: "export"`)**: sin SSR, sin ISR, sin
API Routes, sin Middleware, sin servidor Node en producción. El resultado de
`npm run build` es una carpeta `out/` de archivos estáticos que se puede
servir desde **GitHub Pages**, Cloudflare Pages, Netlify, Firebase Hosting o
Vercel (static export) indistintamente.

## Stack

- Next.js 15 (App Router) + `output: "export"`
- React 18 + TypeScript estricto
- Tailwind CSS
- lucide-react (íconos)
- Vitest (tests unitarios de la lógica de fechas/feriados)
- PWA: `manifest.webmanifest` + service worker propio (sin dependencias)

## Desarrollo local

```bash
npm install
npm run dev         # http://localhost:3000
npm run typecheck
npm run lint
npm run test         # tests unitarios (Vitest)
npm run build        # genera ./out
```

Para previsualizar exactamente el build de producción:

```bash
npm run build
npx serve out
```

## Estructura

```
data/feriados-chile-2026.json   # única fuente de datos de la app
src/
  app/                          # 3 rutas: / , /timeline , /calendar
                                 # + sitemap.ts, opengraph-image.tsx, not-found.tsx
  components/                   # UI (dashboard, timeline, calendar, ui/)
  context/                      # ThemeContext (claro/oscuro), HolidayFilterContext
  hooks/                        # useNow, useHolidayData (cálculo derivado)
  lib/                          # dates, holidays, calendar, format, flag
  types/                        # tipos del JSON y del modelo normalizado
public/
  manifest.webmanifest, sw.js, robots.txt, icons/, .nojekyll
.github/workflows/deploy.yml    # build + deploy automático a GitHub Pages
```

## Cambiar de país / año

1. Reemplaza el contenido de `data/feriados-chile-2026.json` por otro con el
   mismo esquema (`pais`, `codigoPais`, `locale`, `anio`, `actualizado`,
   `notas`, `reglaGeneral`, `feriadosGenerales`, `feriadosEspecificos`).
2. Ajusta el import en `src/lib/data.ts` si cambias el nombre del archivo.
3. `codigoPais` (ISO 3166-1 alpha-2, ej. `"CL"`) determina la bandera que se
   muestra en el dashboard y la imagen Open Graph; `locale` (ej. `"es-CL"`)
   determina el idioma de fechas y meses. Si se omiten, la app usa un ícono
   de globo y `"es"` por defecto — no hace falta tocar ningún componente.

Todo el resto de la aplicación (dashboard, timeline, calendario y sus
estadísticas por mes) se recalcula solo a partir de ese archivo.

## Qué hace cada pantalla

- **Inicio**: estado del día (feriado/domingo/laboral), próximo feriado con
  cuenta regresiva, último feriado — ambos con nota de "feriado puente" si
  corresponde.
- **Línea de tiempo**: todos los feriados del año, agrupados por mes, con
  autoscroll al feriado de hoy/próximo al entrar y un botón para volver ahí.
- **Calendario**: grilla mensual (con swipe para cambiar de mes) + un
  "Resumen del mes" que cambia según el mes que se esté viendo (feriados,
  entre semana vs. fin de semana, domingos, fines de semana largos y
  feriados puente de ese mes específico).

El filtro "incluir regionales y comunales" (por defecto solo nacionales) y
el modo claro/oscuro están disponibles en las 3 pantallas y se guardan en
`localStorage`.

## Despliegue en GitHub Pages

El workflow `.github/workflows/deploy.yml` ya está listo:

1. En GitHub, ve a **Settings → Pages → Build and deployment → Source** y
   selecciona **GitHub Actions**.
2. Haz push a `main`. El workflow calcula automáticamente:
   - `basePath`: repo de proyecto (`usuario.github.io/mi-repo`) →
     `/mi-repo`; repo de usuario/organización (`mi-usuario.github.io`) →
     vacío.
   - `NEXT_PUBLIC_SITE_URL`: la URL pública final (con basePath incluido),
     usada para armar URLs absolutas en el sitemap y en las metadatas
     Open Graph/Twitter.
3. El sitio queda publicado en la URL que indique la pestaña **Actions** al
   finalizar el deploy.

### Notas de compatibilidad con GitHub Pages

- `public/.nojekyll` evita que GitHub Pages (Jekyll) ignore la carpeta
  `_next/` (empieza con `_`). Sin este archivo el sitio no carga.
- `trailingSlash: true` + exportación estática generan un `index.html` real
  por cada ruta (`/`, `/timeline/`, `/calendar/`), así que refrescar el
  navegador en cualquier ruta funciona sin configuración extra.
- El `basePath`/`assetPrefix` se inyectan por variable de entorno
  (`NEXT_PUBLIC_BASE_PATH`) solo en build time; en desarrollo local queda
  vacío.
- `next/image` no se usa (requiere optimización server-side); todos los
  íconos son SVG/PNG servidos como archivos estáticos.
- **Service worker**: los documentos HTML se sirven con estrategia
  network-first (la red manda si hay conexión; la caché es solo el
  fallback offline). Es clave para GitHub Pages porque cada deploy nuevo
  **reemplaza** todos los archivos — si el HTML quedara cacheado con
  stale-while-revalidate, podría apuntar a chunks de `_next/static` que ya
  no existen en el servidor y romper la app hasta un hard refresh. Los
  assets con hash (`_next/static/*`, inmutables por diseño de Next) sí
  usan cache-first sin problema.

### Otros hostings estáticos

El mismo `out/` sirve para Cloudflare Pages, Netlify o Firebase Hosting. Si
el sitio se sirve en la raíz del dominio, no hace falta definir
`NEXT_PUBLIC_BASE_PATH` (queda vacío por defecto); para tener sitemap y
metadata Open Graph con URLs absolutas, define `NEXT_PUBLIC_SITE_URL` con
la URL pública final.

## Seguridad

`npm audit` puede reportar CVEs de Next.js relacionados con su **servidor**
(SSRF en upgrades de WebSocket, middleware, React Server Components, Image
Optimization API). Ninguno aplica acá: este proyecto nunca ejecuta
`next start` ni un servidor Next.js en producción, solo sirve los archivos
estáticos de `out/`.
