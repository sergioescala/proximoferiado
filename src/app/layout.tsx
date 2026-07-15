import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AppNav } from "@/components/AppNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { HolidayFilterProvider } from "@/context/HolidayFilterContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { holidaysData } from "@/lib/data";
import "./globals.css";

// Se ejecuta antes de la hidratación para fijar el tema (localStorage o
// preferencia del sistema) sin parpadeo. Es JS 100% cliente embebido en el
// HTML estático, sin ninguna dependencia de servidor.
const THEME_INIT_SCRIPT = `
  try {
    var stored = localStorage.getItem('proximoferiado:tema');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
`;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

// La Metadata API de Next no antepone basePath a `manifest`/`icons` en
// exportación estática, así que se arma la ruta absoluta a mano. Esto es lo
// único (además del service worker) que necesita conocer el basePath.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
const title = `Próximo feriado · ${holidaysData.pais} ${holidaysData.anio}`;
const description = `Feriados oficiales de ${holidaysData.pais} para ${holidaysData.anio}: próximo feriado, cuenta regresiva, calendario y feriados puente.`;

export const metadata: Metadata = {
  // OJO: solo el origen (protocolo+host), sin el basePath. Next ya resuelve
  // las rutas auto-detectadas (como opengraph-image) con el basePath
  // incluido; si acá también lo agregamos, queda duplicado en la URL final
  // (".../mi-repo/mi-repo/opengraph-image"). Sin NEXT_PUBLIC_SITE_URL
  // (build local, por ejemplo) se deja sin definir.
  metadataBase: siteUrl ? new URL(new URL(siteUrl).origin) : undefined,
  title,
  description,
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/icons/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/icons/favicon-16.png`, sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Feriados",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: holidaysData.locale ?? "es",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = holidaysData.locale ?? "es";

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="min-h-screen bg-canvas font-sans antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
        >
          Saltar al contenido
        </a>
        <ThemeProvider>
          <HolidayFilterProvider>
            {/* En lg el nav pasa de barra inferior a rail lateral fijo de
                240px; el pl-60 reserva ese espacio y el contenido se centra
                en lo que queda. */}
            <div className="lg:pl-60">
              <div
                id="contenido"
                className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-[calc(6rem+env(safe-area-inset-bottom))] md:max-w-2xl lg:max-w-5xl lg:pb-10"
              >
                {children}
              </div>
            </div>
            <AppNav />
          </HolidayFilterProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
