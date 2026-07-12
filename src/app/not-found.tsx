import Link from "next/link";
import { CalendarX2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <CalendarX2 className="h-12 w-12 text-ink-faint" strokeWidth={1.5} />
      <h1 className="mt-4 text-xl font-bold text-ink">Página no encontrada</h1>
      <p className="mt-2 text-sm text-ink-muted">Esta fecha no existe en el calendario de la app.</p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink active:scale-95"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
