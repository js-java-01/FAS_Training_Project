import type { CalendarAdapter } from "@/types/calendar";
import { BigCalendar } from "./BigCalendar";

interface Props<T> {
  data: T[] | undefined;
  adapter: CalendarAdapter<T>;
}

export function EntityCalendar<T>({
  data,
  adapter,
}: Props<T>) {
  const { mapToEvent, renderDetail, renderLegend } = adapter;

  return (
    <div className="space-y-4">
      {/* Legend */}
      {renderLegend && <div>{renderLegend()}</div>}

      <BigCalendar<T>
        data={data}
        mapEvent={mapToEvent}
        renderDetail={renderDetail}
      />
    </div>
  );
}
