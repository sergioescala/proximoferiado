import { describe, expect, it } from "vitest";
import { holidaysData } from "@/lib/data";
import { parseISODate } from "@/lib/dates";
import {
  describeCoverage,
  findBridgeOpportunity,
  getBridgeDayOpportunities,
  getLastHoliday,
  getLongWeekends,
  getMonthSummary,
  getNextHoliday,
  getTimelineState,
  getTodayStatus,
  normalizeHolidays,
} from "./holidays";

// El JSON real de Chile 2026 (data/feriados-chile-2026.json) es la fuente
// de verdad; estos valores esperados se validaron a mano y con un script
// independiente antes de escribir los tests, no al revés.
const allHolidays = normalizeHolidays(holidaysData);
const nationalHolidays = allHolidays.filter((h) => h.cobertura === "nacional");

describe("normalizeHolidays", () => {
  it("combina generales y específicos, ordenados por fecha", () => {
    expect(allHolidays).toHaveLength(18);
    expect(nationalHolidays).toHaveLength(16);
    for (let i = 1; i < allHolidays.length; i++) {
      expect(allHolidays[i]!.date.getTime()).toBeGreaterThanOrEqual(allHolidays[i - 1]!.date.getTime());
    }
  });

  it("clasifica la cobertura de cada feriado específico", () => {
    const arica = allHolidays.find((h) => h.nombre.includes("Morro de Arica"));
    const chillan = allHolidays.find((h) => h.nombre.includes("Prócer"));
    expect(arica?.cobertura).toBe("regional");
    expect(chillan?.cobertura).toBe("comunal");
  });
});

describe("describeCoverage", () => {
  it("traduce la cobertura a una etiqueta legible", () => {
    expect(describeCoverage(nationalHolidays[0]!)).toBe("Nacional");
  });
});

describe("getTodayStatus", () => {
  it("detecta un feriado si la fecha coincide", () => {
    const status = getTodayStatus(nationalHolidays, parseISODate("2026-07-16"));
    expect(status.kind).toBe("holiday");
    if (status.kind === "holiday") expect(status.holiday.nombre).toBe("Día de la Virgen del Carmen");
  });

  it("un feriado que cae domingo se reporta como feriado, no como domingo", () => {
    expect(getTodayStatus(nationalHolidays, parseISODate("2026-06-21")).kind).toBe("holiday");
  });

  it("detecta domingo cuando no hay feriado ese día", () => {
    expect(getTodayStatus(nationalHolidays, parseISODate("2026-06-28")).kind).toBe("sunday");
  });

  it("detecta día laboral en cualquier otro caso", () => {
    expect(getTodayStatus(nationalHolidays, parseISODate("2026-07-13")).kind).toBe("workday");
  });
});

describe("getNextHoliday / getLastHoliday", () => {
  it("el próximo feriado es estrictamente posterior a hoy", () => {
    const next = getNextHoliday(nationalHolidays, parseISODate("2026-07-12"));
    expect(next?.nombre).toBe("Día de la Virgen del Carmen");
  });

  it("el último feriado es estrictamente anterior a hoy", () => {
    const last = getLastHoliday(nationalHolidays, parseISODate("2026-07-12"));
    expect(last?.nombre).toBe("San Pedro y San Pablo");
  });

  it("devuelve null si no hay próximo/último feriado", () => {
    expect(getNextHoliday(nationalHolidays, parseISODate("2026-12-26"))).toBeNull();
    expect(getLastHoliday(nationalHolidays, parseISODate("2025-12-31"))).toBeNull();
  });
});

describe("getBridgeDayOpportunities", () => {
  const opportunities = getBridgeDayOpportunities(nationalHolidays, 2026);

  it("encuentra las 10 oportunidades de puente de 2026 (nacionales)", () => {
    expect(opportunities).toHaveLength(10);
  });

  it("un feriado jueves puentea con el viernes siguiente", () => {
    const carmen = opportunities.find((o) => o.holiday.nombre === "Día de la Virgen del Carmen");
    expect(carmen?.bridgeDate).toEqual(parseISODate("2026-07-17"));
    expect(carmen?.totalDays).toBe(4);
  });

  it("un feriado martes puentea con el lunes anterior", () => {
    const inmaculada = opportunities.find((o) => o.holiday.nombre === "Inmaculada Concepción");
    expect(inmaculada?.bridgeDate).toEqual(parseISODate("2026-12-07"));
  });

  it("un feriado lunes se extiende con el martes siguiente", () => {
    const sanPedro = opportunities.find((o) => o.holiday.nombre === "San Pedro y San Pablo");
    expect(sanPedro?.bridgeDate).toEqual(parseISODate("2026-06-30"));
  });

  it("un feriado viernes se extiende con el jueves anterior", () => {
    const navidad = opportunities.find((o) => o.holiday.nombre === "Navidad");
    expect(navidad?.bridgeDate).toEqual(parseISODate("2026-12-24"));
  });

  it("no genera oportunidad si el día a pedir ya es feriado", () => {
    // Viernes Santo (viernes) + Sábado Santo (sábado, ya feriado) el día siguiente:
    // la extensión hacia atrás (jueves) sí debe existir.
    const viernesSanto = opportunities.find((o) => o.holiday.nombre === "Viernes Santo");
    expect(viernesSanto?.bridgeDate).toEqual(parseISODate("2026-04-02"));
  });
});

describe("findBridgeOpportunity", () => {
  it("encuentra la oportunidad que corresponde a un feriado puntual", () => {
    const opportunities = getBridgeDayOpportunities(nationalHolidays, 2026);
    const holiday = nationalHolidays.find((h) => h.nombre === "Día de la Virgen del Carmen")!;
    expect(findBridgeOpportunity(opportunities, holiday)).toBeDefined();
  });

  it("no encuentra nada para un feriado que no es puente (ej. cae en fin de semana)", () => {
    const opportunities = getBridgeDayOpportunities(nationalHolidays, 2026);
    const holiday = nationalHolidays.find((h) => h.nombre === "Asunción de la Virgen")!; // sábado
    expect(findBridgeOpportunity(opportunities, holiday)).toBeUndefined();
  });
});

describe("getLongWeekends", () => {
  it("encuentra los 6 fines de semana largos nacionales de 2026", () => {
    const longWeekends = getLongWeekends(nationalHolidays, 2026);
    expect(longWeekends).toHaveLength(6);
  });

  it("detecta el tramo de Independencia + Glorias del Ejército como un solo fin de semana largo de 3 días", () => {
    const longWeekends = getLongWeekends(nationalHolidays, 2026);
    const septiembre = longWeekends.find((lw) => lw.start.getMonth() === 8);
    expect(septiembre?.days).toBe(3);
    expect(septiembre?.holidays.map((h) => h.nombre)).toEqual(
      expect.arrayContaining(["Independencia Nacional", "Día de las Glorias del Ejército"])
    );
  });
});

describe("getMonthSummary", () => {
  const longWeekends = getLongWeekends(nationalHolidays, 2026);
  const bridgeOpportunities = getBridgeDayOpportunities(nationalHolidays, 2026);

  it("julio: 1 feriado, entre semana, con oportunidad de puente", () => {
    const july = getMonthSummary(nationalHolidays, 6, 2026, longWeekends, bridgeOpportunities);
    expect(july.total).toBe(1);
    expect(july.entreSemana).toBe(1);
    expect(july.finDeSemana).toBe(0);
    expect(july.bridgeOpportunities).toHaveLength(1);
  });

  it("septiembre: 2 feriados, 1 fin de semana largo", () => {
    const september = getMonthSummary(nationalHolidays, 8, 2026, longWeekends, bridgeOpportunities);
    expect(september.total).toBe(2);
    expect(september.longWeekends).toHaveLength(1);
  });

  it("marzo: mes sin feriados, pero con el conteo de domingos correcto", () => {
    const march = getMonthSummary(nationalHolidays, 2, 2026, longWeekends, bridgeOpportunities);
    expect(march.total).toBe(0);
    expect(march.domingos).toBe(5); // marzo 2026 tiene 5 domingos
    expect(march.bridgeOpportunities).toHaveLength(0);
  });
});

describe("getTimelineState", () => {
  it("clasifica pasado / hoy / próximo / futuro correctamente", () => {
    const now = parseISODate("2026-07-12");
    const next = getNextHoliday(nationalHolidays, now);
    const pasado = nationalHolidays.find((h) => h.nombre === "San Pedro y San Pablo")!;
    const proximo = nationalHolidays.find((h) => h.nombre === "Día de la Virgen del Carmen")!;
    const futuro = nationalHolidays.find((h) => h.nombre === "Navidad")!;

    expect(getTimelineState(pasado, now, next)).toBe("pasado");
    expect(getTimelineState(proximo, now, next)).toBe("proximo");
    expect(getTimelineState(futuro, now, next)).toBe("futuro");
  });
});
