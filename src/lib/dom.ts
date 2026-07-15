/**
 * Utilidades que dependen del navegador. Las animaciones CSS se anulan
 * globalmente en globals.css; este helper existe para el movimiento que se
 * dispara desde JS (scrollIntoView, View Transitions).
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
