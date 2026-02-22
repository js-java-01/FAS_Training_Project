import type { Course } from "@/types/course";
import ActionBtn from "@/components/data_table/ActionBtn";
import { FiEye, FiEdit, FiTrash2, FiUserPlus } from "react-icons/fi";
import type { ColumnDef } from "@tanstack/react-table";
import SortHeader from "@/components/data_table/SortHeader";
import { Checkbox } from "@/components/ui/checkbox";

export const getColumns = (
  handlers: {
    onView?: (c: Course) => void;
    onEdit?: (c: Course) => void;
    onDelete?: (c: Course) => void;
    onEnroll?: (c: Course) => void;
  },
  isStudentMode = false,
) => {
  const columns: ColumnDef<Course, any>[] = [
    {
      id: "select",
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "number",
      header: "#",
      size: 60,
      cell: ({ row, table }) =>
        row.index +
        1 +
        table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "courseName",
      header: (info) => <SortHeader title="Course name" info={info} />,
      cell: (info) => <div>{info.getValue()}</div>,
      meta: { title: "Course name" },
    },
    {
      accessorKey: "courseCode",
      header: (info) => <SortHeader title="Code" info={info} />,
      cell: (info) => <div>{info.getValue()}</div>,
      meta: { title: "Code" },
    },
    {
      accessorKey: "trainerName",
      header: (info) => <SortHeader title="Trainer" info={info} />,
      cell: (info) => <div>{info.getValue() ?? "-"}</div>,
      meta: { title: "Trainer" },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: (info) => <div>{info.getValue() ?? "-"}</div>,
      meta: { title: "Price" },
    },
    {
      accessorKey: "createdByName",
      header: (info) => <SortHeader title="Created by" info={info} />,
      cell: (info) => <div className="text-sm">{info.getValue() ?? "-"}</div>,
      meta: { title: "Created by" },
      size: 180,
    },
    {
      accessorKey: "createdDate",
      header: (info) => <SortHeader title="Created date" info={info} />,
      cell: (info) => {
        const v = info.getValue() as string | undefined;
        if (!v) return <div>-</div>;
        const d = new Date(v);
        const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        return <div className="text-sm whitespace-nowrap">{formatted}</div>;
      },
      meta: { title: "Created date" },
      size: 160,
    },
    {
      accessorKey: "updatedDate",
      header: (info) => <SortHeader title="Updated date" info={info} />,
      cell: (info) => {
        const v = info.getValue() as string | undefined;
        if (!v) return <div>-</div>;
        const d = new Date(v);
        const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        return <div className="text-sm whitespace-nowrap">{formatted}</div>;
      },
      meta: { title: "Updated date" },
      size: 160,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => <div>{info.getValue()}</div>,
      meta: { title: "Status" },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const c = row.original as Course;
        if (isStudentMode) {
          return (
            <div className="flex items-center gap-2">
              <ActionBtn
                icon={<FiEye />}
                tooltipText="View detail"
                onClick={() => handlers.onView?.(c)}
              />
              <ActionBtn
                icon={<FiUserPlus />}
                tooltipText="Enroll"
                onClick={() => handlers.onEnroll?.(c)}
              />
            </div>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <ActionBtn
              icon={<FiEye />}
              tooltipText="View"
              onClick={() => handlers.onView?.(c)}
            />
            <ActionBtn
              icon={<FiEdit />}
              tooltipText="Edit"
              onClick={() => handlers.onEdit?.(c)}
            />
            <ActionBtn
              icon={<FiTrash2 />}
              tooltipText="Delete"
              onClick={() => handlers.onDelete?.(c)}
            />
          </div>
        );
      },
      meta: { title: "Actions" },
      size: 120,
    },
  ];

  return columns;
};
