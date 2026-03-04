import { useState, useMemo } from "react";
import {
  Calendar as RBCalendar,
  dayjsLocalizer,
  Views,
  type View,
  type ToolbarProps,
} from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import "./big-calendar.css";

const localizer = dayjsLocalizer(dayjs);

export interface CalendarEvent<T = unknown> {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  raw?: T;
}

interface Props<T> {
  data: T[] | undefined;
  mapEvent: (item: T) => CalendarEvent<T>;
  onRangeChange?: (start: Date, end: Date) => void;
  renderDetail?: (item: T) => React.ReactNode;
}

export function BigCalendar<T>({
  data,
  mapEvent,
  onRangeChange,
  renderDetail,
}: Props<T>) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<T | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const events: CalendarEvent<T>[] = useMemo(() => {
    if (!data) return [];
    return data.map(mapEvent);
  }, [data, mapEvent]);

  const CustomToolbar: React.FC<
    ToolbarProps<CalendarEvent<T>, object>
  > = (toolbar) => {
    return (
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 p-4 rounded-2xl
                      bg-white dark:bg-gray-900
                      border border-gray-200 dark:border-gray-700
                      shadow-sm">

        {/* LEFT */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Navigation */}
          <div className="flex items-center
                          bg-gray-100 dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          rounded-xl">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg hover:bg-blue-800 hover:text-white transition-all"
              onClick={() => toolbar.onNavigate("PREV")}
            >
              <ChevronLeft size={18} />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg hover:bg-blue-800 hover:text-white transition-all"
              onClick={() => toolbar.onNavigate("NEXT")}
            >
              <ChevronRight size={18} />
            </Button>
          </div>

          {/* Date Picker */}
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="rounded-xl
                           border-blue-200 dark:border-blue-900
                           hover:bg-blue-800 hover:text-white
                           transition"
              >
                <CalendarIcon size={18} />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0
                                       bg-white dark:bg-gray-900
                                       border border-gray-200 dark:border-gray-700
                                       shadow-xl">
              <Calendar
                mode="single"
                selected={date}
                 captionLayout="dropdown"
                onSelect={(selectedDate) => {
                  if (!selectedDate) return;

                  setDate(selectedDate);
                  toolbar.onNavigate("DATE", selectedDate);
                  setPickerOpen(false);
                }}

                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Today */}
          <Button
            onClick={() => toolbar.onNavigate("TODAY")}
            className="bg-blue-800 hover:bg-blue-900 text-white rounded-xl px-5 shadow-sm"
          >
            Today
          </Button>

          {/* Label */}
          <div className="text-xl font-semibold
                          text-blue-900 dark:text-blue-400
                          tracking-tight">
            {toolbar.label}
          </div>
        </div>

        {/* RIGHT - View Switch */}
        <div className="flex items-center
                        bg-gray-100 dark:bg-gray-800
                        border border-gray-200 dark:border-gray-700
                        p-1 rounded-xl">
          {[Views.DAY, Views.WEEK, Views.MONTH].map((v) => {
            const active = view === v;

            return (
              <Button
                key={v}
                size="sm"
                onClick={() => {
                  toolbar.onView(v);
                  setView(v);
                }}
                className={`
                  rounded-lg px-5 transition-all duration-200
                  ${
                    active
                      ? "bg-blue-800 text-white shadow-md"
                      : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                  }
                `}
              >
                {v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <RBCalendar<CalendarEvent<T>>
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: 700 }}
        components={{
          toolbar: CustomToolbar,
          event: ({ event }) => (
            <div
              className="text-white text-xs px-2 py-1 rounded-lg font-medium truncate"
              style={{
                backgroundColor: event.color || "#1e40af",
              }}
            >
              {event.title}
            </div>
          ),
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.color || "#1e40af",
            borderRadius: "6px",
            border: "none",
            padding: "2px 6px",
          },
        })}
        onSelectEvent={(event) => {
          if (renderDetail && event.raw) {
            setSelected(event.raw as T);
          }
        }}
        onRangeChange={(range) => {
          if (!onRangeChange) return;

          if (Array.isArray(range) && range.length > 0) {
            onRangeChange(range[0], range[range.length - 1]);
          } else if (
            typeof range === "object" &&
            "start" in range &&
            "end" in range
          ) {
            onRangeChange(range.start, range.end);
          }
        }}
      />

      {/* Modal */}
      {renderDetail && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />

          <div className="relative w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
            <Card className="rounded-2xl shadow-2xl
                              bg-white dark:bg-gray-900
                              border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6
                                      text-gray-800 dark:text-gray-200">
                {renderDetail(selected)}
              </CardContent>

              <CardFooter className="flex justify-end p-4 pt-0">
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  className="dark:border-gray-600 dark:text-gray-300"
                >
                  Close
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
