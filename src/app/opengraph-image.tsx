import { ImageResponse } from "next/og";
import { holidaysData } from "@/lib/data";

// Requerido por output:"export": sin esto, Next no sabe generar esta ruta
// como archivo estático en build time.
export const dynamic = "force-static";
export const alt = "Próximo Feriado";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Imagen para compartir en redes/WhatsApp. Se genera en build time a
 * partir del mismo JSON que alimenta toda la app (país/año dinámicos), no
 * es un PNG estático que haya que regenerar a mano si se cambia de país.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1D4ED8 0%, #0F172A 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.14)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            marginBottom: 32,
          }}
        >
          📅
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>Próximo Feriado</div>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 500, color: "#BFDBFE", marginTop: 16 }}>
          Calendario, línea de tiempo y feriados puente
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 36 }}>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.14)",
              borderRadius: 24,
              padding: "12px 28px",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {holidaysData.pais}
          </div>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.14)",
              borderRadius: 24,
              padding: "12px 28px",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {holidaysData.anio}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
