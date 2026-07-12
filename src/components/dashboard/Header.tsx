import { countryCodeToFlagEmoji } from "@/lib/flag";
import { formatDayMonth, parseISODate } from "@/lib/dates";
import type { HolidaysData } from "@/types/holidays";

export function Header({ data }: { data: HolidaysData }) {
  const flag = countryCodeToFlagEmoji(data.codigoPais);
  const locale = data.locale ?? "es";

  return (
    <header className="flex items-center justify-between px-5 pt-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none" role="img" aria-label={data.pais}>
          {flag}
        </span>
        <div>
          <p className="text-[15px] font-semibold leading-tight text-ink">
            {data.pais} <span className="text-ink-faint">· {data.anio}</span>
          </p>
          <p className="text-[11px] leading-tight text-ink-faint">
            Actualizado {formatDayMonth(parseISODate(data.actualizado), locale)}
          </p>
        </div>
      </div>
    </header>
  );
}
