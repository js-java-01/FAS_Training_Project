import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Eye } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import type { SemesterResponse } from "./SemesterCard";
import { createBaseColumns } from "@/components/data_table/baseColumns";

const columnHelper = createColumnHelper<SemesterResponse>();
const base = createBaseColumns<SemesterResponse>();

export const getSemesterColumns = (
  onView: (s: SemesterResponse) => void,
  onEdit?: (s: SemesterResponse) => void,
  //   onDelete?: (s: SemesterResponse) => void,
) => [
  base.selectColumn,
  base.numberColumn,

  columnHelper.accessor("name", {
    header: "Semester Name",
    size: 200,
    cell: (info) => <span className="font-bold text-blue-600">{info.getValue()}</span>,
    meta: {
      title: "Semester Name"
    }
  }),

  columnHelper.accessor("startDate", {
    header: "Start Date",
    size: 150,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {dayjs(info.getValue()).format("DD/MM/YYYY")}
      </div>
    ),
    meta: {
      title: "Start Date"
    }
  }),

  columnHelper.accessor("endDate", {
    header: "End Date",
    size: 150,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {dayjs(info.getValue()).format("DD/MM/YYYY")}
      </div>
    ),
    meta: {
      title: "End Date"
    }
  }),

  columnHelper.display({
    id: "status",
    header: "Status",
    size: 150,
    cell: ({ row }) => {
      const now = dayjs();
      const start = dayjs(row.original.startDate);
      const end = dayjs(row.original.endDate);

      if (now.isBefore(start))
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Sắp diễn ra
          </Badge>
        );
      if (now.isAfter(end))
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
            Đã kết thúc
          </Badge>
        );
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse">
          Đang diễn ra
        </Badge>
      );
    },
    meta: {
      title: "Status"
    }
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 120,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => onView(row.original)}>
          <Eye className="w-4 h-4" />
        </Button>
        {onEdit && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600" onClick={() => onEdit(row.original)}>
            <Pencil className="w-4 h-4" />
          </Button>
        )}
        {/* {onDelete && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => onDelete(row.original)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )} */}
      </div>
    ),
    meta: {
      title: "Actions"
    }
  }),
 /* ================= COLUMN CONTROL ================= */
  base.columnControl
];
