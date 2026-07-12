import { describe, expect, it } from "vitest";
import {
  addDays,
  diffInCalendarDays,
  formatDayMonth,
  formatFullDate,
  formatMonthName,
  formatWeekday,
  isSameDay,
  isWeekend,
  parseISODate,
  startOfDay,
  toKey,
  weekdayNameByIndex,
} from "./dates";

describe("parseISODate", () => {
  it("parsea a medianoche local, sin desfase de zona horaria", () => {
    const date = parseISODate("2026-07-16");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(6); // julio = índice 6
    expect(date.getDate()).toBe(16);
    expect(date.getHours()).toBe(0);
  });

  it("el día de la semana coincide con el calendario real (2026-01-01 es jueves)", () => {
    expect(parseISODate("2026-01-01").getDay()).toBe(4);
  });
});

describe("toKey / round-trip con parseISODate", () => {
  it("produce el mismo string que se usó para parsear", () => {
    expect(toKey(parseISODate("2026-12-08"))).toBe("2026-12-08");
  });
});

describe("startOfDay", () => {
  it("trunca la hora a medianoche sin cambiar el día", () => {
    const withTime = new Date(2026, 6, 16, 23, 59, 59);
    const truncated = startOfDay(withTime);
    expect(truncated.getHours()).toBe(0);
    expect(truncated.getDate()).toBe(16);
  });
});

describe("isSameDay", () => {
  it("es true para el mismo día con horas distintas", () => {
    expect(isSameDay(new Date(2026, 6, 16, 3), new Date(2026, 6, 16, 22))).toBe(true);
  });

  it("es false para días distintos", () => {
    expect(isSameDay(new Date(2026, 6, 16), new Date(2026, 6, 17))).toBe(false);
  });
});

describe("addDays", () => {
  it("suma días cruzando el fin de mes", () => {
    const result = addDays(new Date(2026, 5, 29), 3); // 29 jun + 3 = 2 jul
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(2);
  });

  it("resta días con offset negativo", () => {
    const result = addDays(new Date(2026, 6, 1), -1); // 1 jul - 1 = 30 jun
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(30);
  });
});

describe("diffInCalendarDays", () => {
  it("cuenta 92 días entre Año Nuevo y Viernes Santo 2026", () => {
    expect(diffInCalendarDays(parseISODate("2026-04-03"), parseISODate("2026-01-01"))).toBe(92);
  });

  it("es negativo cuando la primera fecha es anterior", () => {
    expect(diffInCalendarDays(parseISODate("2026-01-01"), parseISODate("2026-04-03"))).toBe(-92);
  });

  it("es 0 para el mismo día", () => {
    expect(diffInCalendarDays(parseISODate("2026-07-16"), parseISODate("2026-07-16"))).toBe(0);
  });
});

describe("isWeekend", () => {
  it("es true para sábado y domingo", () => {
    expect(isWeekend(parseISODate("2026-08-15"))).toBe(true); // sábado
    expect(isWeekend(parseISODate("2026-11-01"))).toBe(true); // domingo
  });

  it("es false de lunes a viernes", () => {
    expect(isWeekend(parseISODate("2026-07-16"))).toBe(false); // jueves
  });
});

describe("formateo con locale es-CL", () => {
  const virgenDelCarmen = parseISODate("2026-07-16"); // jueves

  it("formatWeekday capitaliza el día", () => {
    expect(formatWeekday(virgenDelCarmen, "es-CL")).toBe("Jueves");
  });

  it("formatMonthName capitaliza el mes", () => {
    expect(formatMonthName(6, "es-CL")).toBe("Julio");
  });

  it("formatDayMonth combina día y mes", () => {
    expect(formatDayMonth(virgenDelCarmen, "es-CL")).toBe("16 de julio");
  });

  it("formatFullDate incluye día de semana, fecha y año", () => {
    const full = formatFullDate(virgenDelCarmen, "es-CL");
    expect(full).toContain("Jueves");
    expect(full).toContain("16");
    expect(full).toContain("julio");
    expect(full).toContain("2026");
  });
});

describe("weekdayNameByIndex", () => {
  it("mapea el índice de Date#getDay (0=domingo) al nombre correcto", () => {
    expect(weekdayNameByIndex(0, "es-CL")).toBe("Domingo");
    expect(weekdayNameByIndex(1, "es-CL")).toBe("Lunes");
    expect(weekdayNameByIndex(6, "es-CL")).toBe("Sábado");
  });
});
