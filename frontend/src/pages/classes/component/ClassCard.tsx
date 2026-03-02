import { CalendarDays, Clock, Users } from "lucide-react";
import { GenericDataCard, type DataItem, type StatusConfig } from "../../../components/card/GenericDataCard";

interface ClassProps {
  code: string;
  name: string;
  instructor: string;
  schedule: string;
  capacity: string;
  status: "open" | "closed";
}

export const ClassCard = ({ code, name, instructor, schedule, capacity, status }: ClassProps) => {
  const statusConfig: StatusConfig = {
    label: status === "open" ? "Opening" : "Closed",
    variant: "outline",
    className:
      status === "open"
        ? "text-green-600 bg-green-50 border-green-200 hover:bg-green-100 border-transparent"
        : "text-red-600 bg-red-50 border-red-200 hover:bg-red-100 border-transparent",
  };

  const items: DataItem[] = [
    {
      icon: Users,
      label: "GV.",
      value: instructor,
    },
    {
      icon: CalendarDays,
      value: schedule,
    },
    {
      icon: Clock,
      label: "Sĩ số:",
      value: capacity,
    },
  ];

  return (
    <GenericDataCard
      tag={code}
      title={name}
      status={statusConfig}
      items={items}
      action={{
        label: status === "open" ? "Enroll Now" : "Full Slot",
        disabled: status === "closed",
        className: "bg-blue-800 hover:bg-blue-900 text-white",
        onClick: () => console.log("Enroll clicked for", code),
      }}
    />
  );
};
