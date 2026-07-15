import { describe, expect, it } from "vitest";
import { toKey } from "@/lib/dates";
import { moveFocusDate } from "./calendar";

const d = (iso: string) => {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y!, m! - 1, day!);
};

describe("moveFocusDate", () => {
  it("mueve un día con las flechas horizontales", () => {
    expect(toKey(moveFocusDate(d("2026-06-10"), "ArrowLeft"))).toBe("2026-06-09");
    expect(toKey(moveFocusDate(d("2026-06-10"), "ArrowRight"))).toBe("2026-06-11");
  });

  it("mueve una semana con las flechas verticales", () => {
    expect(toKey(moveFocusDate(d("2026-06-10"), "ArrowUp"))).toBe("2026-06-03");
    expect(toKey(moveFocusDate(d("2026-06-10"), "ArrowDown"))).toBe("2026-06-17");
  });

  it("Home/End van al lunes/domingo de la misma semana", () => {
    // 2026-06-10 es miércoles: su semana va del lunes 8 al domingo 14.
    expect(toKey(moveFocusDate(d("2026-06-10"), "Home"))).toBe("2026-06-08");
    expect(toKey(moveFocusDate(d("2026-06-10"), "End"))).toBe("2026-06-14");
    // Un lunes y un domingo se quedan donde están.
    expect(toKey(moveFocusDate(d("2026-06-08"), "Home"))).toBe("2026-06-08");
    expect(toKey(moveFocusDate(d("2026-06-14"), "End"))).toBe("2026-06-14");
  });

  it("cruza límites de mes", () => {
    expect(toKey(moveFocusDate(d("2026-01-31"), "ArrowRight"))).toBe("2026-02-01");
    expect(toKey(moveFocusDate(d("2026-03-01"), "ArrowLeft"))).toBe("2026-02-28");
    expect(toKey(moveFocusDate(d("2026-05-28"), "ArrowDown"))).toBe("2026-06-04");
  });

  it("cruza límites de año (quien llama decide si lo permite)", () => {
    expect(toKey(moveFocusDate(d("2026-12-31"), "ArrowRight"))).toBe("2027-01-01");
    expect(toKey(moveFocusDate(d("2026-01-01"), "ArrowUp"))).toBe("2025-12-25");
  });
});
