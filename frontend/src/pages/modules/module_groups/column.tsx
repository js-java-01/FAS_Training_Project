import { createColumnHelper } from "@tanstack/react-table";
import type { ModuleGroup } from "@/types/module";
import { Badge } from "@/components/ui/badge";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";
import { createBaseColumns } from "@/components/data_table/baseColumns";

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
  const base = createBaseColumns<ModuleGroup>();

  return [
    base.selectColumn,
    base.numberColumn,

    columnHelper.accessor("name", {
      header: (info) => <SortHeader title="Name" info={info} />,
      size: 200,
      cell: (info) => (
        <span className="font-medium">{info.getValue()}</span>
      ),
      meta: {
        title: "Name"
      }
    }),

    columnHelper.accessor("description", {
      header: (info) => <SortHeader title="Description" info={info} />,
      size: 300,
      cell: (info) => (
        <span className="text-muted-foreground line-clamp-2">
          {info.getValue() || "-"}
        </span>
      ),
      meta: {
        title: "Description"
      }
    }),

    columnHelper.accessor("displayOrder", {
      header: (info) => <SortHeader title="Display Order" info={info} />,
      size: 80,
      cell: (info) => (
        <span className="block text-center">{info.getValue()}</span>
      ),
      meta: {
        title: "Display Order"
      }
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
      meta: {
        title: "Status"
      }
    }),

    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader title="Created At" info={info} />,
      size: 160,
      cell: (info) =>
        dayjs(info.getValue()).format("HH:mm DD-MM-YYYY"),
      meta: {
        title: "Created At"
      }
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
      meta: {
        title: "Actions"
      }
    }),

     /* ================= COLUMN CONTROL ================= */
    base.columnControl,
  ];
};
