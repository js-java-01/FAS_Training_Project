import type { CalendarAdapter } from "@/types/calendar";
import { BigCalendar } from "./BigCalendar";
import { Loader2 } from "lucide-react";

interface Props<T> {
  data: T[] | undefined;
  adapter: CalendarAdapter<T>;
  onRangeChange?: (start: Date, end: Date) => void;
  loading?: boolean;
}

export function EntityCalendar<T>({
  data,
  adapter,
  onRangeChange,
  loading,
}: Props<T>) {
  const { mapToEvent, renderDetail, renderLegend } = adapter;

  return (
    <div className="space-y-4">
      {/* Legend */}
      {renderLegend && <div>{renderLegend()}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-800 dark:text-blue-400" />
        </div>
      )}

      <BigCalendar<T>
        data={data}
        mapEvent={mapToEvent}
        renderDetail={renderDetail}
        onRangeChange={onRangeChange}
      />
    </div>
  );
}
