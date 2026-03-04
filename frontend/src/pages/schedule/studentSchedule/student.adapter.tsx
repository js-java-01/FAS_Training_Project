import type { CalendarAdapter } from "@/types/calendar";
import type { CalendarEvent } from "@/components/calendar/BigCalendar";
import type { StudentSchedule } from "./studentCalendar.service";
import dayjs from "dayjs";

const STATUS_COLOR: Record<
  StudentSchedule["attendanceStatus"],
  string
> = {
  PRESENT: "#16a34a",
  ABSENT: "#dc2626",
  NOT_YET: "#2563eb",
};

export const studentCalendarAdapter: CalendarAdapter<StudentSchedule> =
{
  mapToEvent: (
    item
  ): CalendarEvent<StudentSchedule> => ({
    id: item.id,
    title: item.subject,
    start: new Date(`${item.date}T${item.startTime}`),
    end: new Date(`${item.date}T${item.endTime}`),
    color: STATUS_COLOR[item.attendanceStatus],
    raw: item,
  }),

  renderDetail: (item) => (
    <div className="space-y-4">
      <div className="space-x-1">
        <h3 className="text-xl font-semibold">
          {item.subject}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dayjs(item.date).format("MMMM D, YYYY")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-muted-foreground">Room</p>
          <p className="font-medium">{item.room}</p>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground">Lecturer</p>
          <p className="font-medium">{item.lecturer}</p>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground">Time</p>
          <p className="font-medium">
            {item.startTime} - {item.endTime}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground">Status</p>
          <span
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor:
                STATUS_COLOR[item.attendanceStatus] + "20",
              color:
                STATUS_COLOR[item.attendanceStatus],
            }}
          >
            {item.attendanceStatus}
          </span>
        </div>
      </div>
    </div>
  ),
};
