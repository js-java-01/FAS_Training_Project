import { createColumnHelper } from "@tanstack/react-table";
import type { UserDTO } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import { EditIcon, EyeIcon, Trash, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import dayjs from "dayjs";

export type UserTableActions = {
  onView?: (row: UserDTO) => void;
  onEdit?: (row: UserDTO) => void;
  onDelete?: (row: UserDTO) => void;
  onToggleStatus?: (id: string) => void;
};

export const getColumns = (actions?: UserTableActions) => {
  const columnHelper = createColumnHelper<UserDTO>();
  const base = createBaseColumns<UserDTO>();

  return [
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
    }),

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
    }),

    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: "fullName",
      header: (info) => <SortHeader info={info} title="Full Name" />,
      size: 200,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),

    columnHelper.accessor("email", {
      header: (info) => <SortHeader info={info} title="Email" />,
      size: 240,
      cell: (info) => (
        <span className="text-muted-foreground">{info.getValue()}</span>
      ),
    }),

    columnHelper.display({
      id: "roles",
      header: "Role",
      size: 200,
      cell: ({ row }) => {
        const names = row.original.roleNames;
        if (!names?.length)
          return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {names.map((name) => (
              <span
                key={name}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {name}
              </span>
            ))}
          </div>
        );
      },
    }),

    columnHelper.accessor("isActive", {
      id: "isActive",
      header: "Status",
      size: 110,
      cell: (info) => (
        <Badge
          className={
            info.getValue()
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 shadow-none"
              : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none"
          }
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
      enableSorting: false,
    }),

    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader info={info} title="Created At" />,
      size: 160,
      cell: (info) =>
        info.getValue()
          ? dayjs(info.getValue()).format("YYYY-MM-DD HH:mm")
          : "-",
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 140,
      enableHiding: false,
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
          {actions?.onToggleStatus && (
            <ActionBtn
              tooltipText={row.original.isActive ? "Deactivate" : "Activate"}
              icon={<ToggleLeft size={12} />}
              onClick={() => actions.onToggleStatus!(row.original.id!)}
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

    /* ================= COLUMN CONTROL ================= */
    base.columnControl,
  ];
};
