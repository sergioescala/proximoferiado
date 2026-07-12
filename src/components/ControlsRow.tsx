import { HolidayFilterToggle } from "@/components/HolidayFilterToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

export function ControlsRow() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <HolidayFilterToggle />
    </div>
  );
}
