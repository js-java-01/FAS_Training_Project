export interface CalendarEvent<T = unknown> {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  raw?: T;
}

export interface CalendarAdapter<T> {
  mapToEvent: (item: T) => CalendarEvent<T>;
  renderDetail?: (item: T) => React.ReactNode;
  renderLegend?: () => React.ReactNode;
}
