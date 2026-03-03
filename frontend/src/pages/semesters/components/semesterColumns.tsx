import { createColumnHelper } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, Eye } from "lucide-react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import type { SemesterResponse } from "./SemesterCard";

const columnHelper = createColumnHelper<SemesterResponse>();

export const getSemesterColumns = (
  onView: (s: SemesterResponse) => void,
  onEdit?: (s: SemesterResponse) => void,
  //   onDelete?: (s: SemesterResponse) => void,
) => [
  columnHelper.display({
    id: "number",
    header: "#",
    size: 50,
    cell: ({ row, table }) =>
      row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
  }),

  columnHelper.accessor("name", {
    header: "Tên học kỳ",
    size: 200,
    cell: (info) => <span className="font-bold text-blue-600">{info.getValue()}</span>,
  }),

  columnHelper.accessor("startDate", {
    header: "Ngày bắt đầu",
    size: 150,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {dayjs(info.getValue()).format("DD/MM/YYYY")}
      </div>
    ),
  }),

  columnHelper.accessor("endDate", {
    header: "Ngày kết thúc",
    size: 150,
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {dayjs(info.getValue()).format("DD/MM/YYYY")}
      </div>
    ),
  }),

  columnHelper.display({
    id: "status",
    header: "Trạng thái",
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
  }),
];
