import { createColumnHelper } from "@tanstack/react-table";
import type { Department } from "@/types/department";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import SortHeader from "@/components/data_table/SortHeader";
import { Badge } from "@/components/ui/badge";

export type DepartmentTableActions = {
  onView?: (row: Department) => void;
  onEdit?: (row: Department) => void;
  onDelete?: (row: Department) => void;
};

export const getColumns = (actions?: DepartmentTableActions) => {
  const columnHelper = createColumnHelper<Department>();

  return [
    /* ================= SELECT ================= */
    columnHelper.display({
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
    }),

    /* ================= NUMBER ================= */
    columnHelper.display({
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
    }),

    /* ================= NAME ================= */
    columnHelper.accessor("name", {
      header: (info) => <SortHeader info={info} title="Name" />,
      size: 200,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),

    /* ================= CODE ================= */
    columnHelper.accessor("code", {
      header: (info) => <SortHeader info={info} title="Code" />,
      size: 150,
      cell: (info) => (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          {info.getValue()}
        </span>
      ),
    }),

    /* ================= LOCATION ================= */
    columnHelper.accessor("locationName", {
      header: (info) => <SortHeader info={info} title="Location" />,
      size: 180,
      cell: (info) => (
        <span className="text-gray-700">
          {info.getValue() || <span className="text-gray-400">N/A</span>}
        </span>
      ),
    }),

    /* ================= STATUS ================= */
    columnHelper.accessor("status", {
      id: "status",
      header: "Status",
      size: 120,
      cell: (info) => (
        <Badge
          className={
            info.getValue() === "ACTIVE"
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300 shadow-none"
              : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none"
          }
        >
          {info.getValue() === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
      meta: { title: "Status" },
      enableSorting: false,
    }),

    /* ================= DESCRIPTION ================= */
    columnHelper.accessor("description", {
      header: (info) => <SortHeader info={info} title="Description" />,
      size: 280,
      cell: (info) => (
        <span className="line-clamp-2 text-muted-foreground">
          {info.getValue() || "-"}
        </span>
      ),
    }),

    /* ================= ACTIONS ================= */
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => (
        <div className="flex gap-2">
          {actions?.onView && (
            <ActionBtn
              tooltipText="View"
              icon={<EyeIcon size={12} />}
              onClick={() => actions.onView!(row.original)}
            />
          )}
          {actions?.onEdit && (
            <ActionBtn
              tooltipText="Edit"
              icon={<EditIcon size={12} />}
              onClick={() => actions.onEdit!(row.original)}
            />
          )}
          {actions?.onDelete && (
            <ActionBtn
              tooltipText="Delete"
              icon={<Trash size={12} />}
              onClick={() => actions.onDelete!(row.original)}
            />
          )}
        </div>
      ),
      enableSorting: false,
    }),
  ];
};
