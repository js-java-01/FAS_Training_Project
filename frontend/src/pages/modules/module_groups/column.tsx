import { createColumnHelper } from "@tanstack/react-table";
import type { ModuleGroup } from "@/types/module";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";

export type TableActions = {
  onView?: (row: ModuleGroup) => void;
  onEdit?: (row: ModuleGroup) => void;
  onDelete?: (row: ModuleGroup) => void;
};

type PermissionOptions = {
  canUpdate?: boolean;
  canDelete?: boolean;
};

export const getColumns = (
  actions?: TableActions,
  permission?: PermissionOptions
) => {
  const columnHelper = createColumnHelper<ModuleGroup>();

  return [
    columnHelper.display({
      id: "select",
      size: 50,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
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

    columnHelper.accessor("name", {
      header: (info) => <SortHeader title="Name" info={info} />,
      size: 200,
      cell: (info) => (
        <span className="font-medium">{info.getValue()}</span>
      ),
    }),

    columnHelper.accessor("description", {
      header: (info) => <SortHeader title="Description" info={info} />,
      size: 300,
      cell: (info) => (
        <span className="text-muted-foreground line-clamp-2">
          {info.getValue() || "-"}
        </span>
      ),
    }),

    columnHelper.accessor("displayOrder", {
      header: (info) => <SortHeader title="Display Order" info={info} />,
      size: 80,
      cell: (info) => (
        <span className="block text-center">{info.getValue()}</span>
      ),
    }),

    columnHelper.accessor("isActive", {
      header: (info) => <SortHeader info={info} title="Status" />,
      size: 120,
      cell: (info) => (
        <Badge
          className={
            info.getValue()
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-red-100 text-red-700 border-red-200"
          }
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader title="Created At" info={info} />,
      size: 160,
      cell: (info) =>
        dayjs(info.getValue()).format("HH:mm DD-MM-YYYY"),
    }),

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

          {permission?.canUpdate && actions?.onEdit && (
            <ActionBtn
              tooltipText="Edit"
              icon={<EditIcon size={12} />}
              onClick={() => actions.onEdit!(row.original)}
            />
          )}

          {permission?.canDelete && actions?.onDelete && (
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
