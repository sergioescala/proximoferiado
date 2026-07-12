import { CalendarDays } from "lucide-react";
import { STAT_ICONS } from "@/components/stats/statIcons";
import { Card } from "@/components/ui/Card";
import type { HolidayStats } from "@/lib/holidays";
import { buildStatItems } from "@/lib/statItems";

export function StatsGrid({ stats, locale }: { stats: HolidayStats; locale: string }) {
  const items = buildStatItems(stats, locale);

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => {
        const Icon = STAT_ICONS[item.id] ?? CalendarDays;
        return (
          <Card
            key={item.id}
            className="animate-fade-up p-4"
            style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
          >
            <Icon className="h-4 w-4 text-ink-faint" strokeWidth={2} />
            <p className="mt-2 text-xl font-bold leading-none text-ink">{item.value}</p>
            <p className="mt-1.5 text-[11px] leading-snug text-ink-muted">{item.label}</p>
            {item.caption ? (
              <p className="mt-1 truncate text-[10px] leading-snug text-ink-faint">{item.caption}</p>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
