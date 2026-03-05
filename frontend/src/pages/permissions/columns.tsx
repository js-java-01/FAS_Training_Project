import { createColumnHelper } from "@tanstack/react-table";
import type { Permission } from "@/types/permission";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import dayjs from "dayjs";
import { createBaseColumns } from "@/components/data_table/baseColumns";

export type TableActions = {
  onView?: (row: Permission) => void;
  onEdit?: (row: Permission) => void;
  onDelete?: (row: Permission) => void;
};

interface PermissionFlags {
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const getColumns = (
  actions?: TableActions,
  permissions?: PermissionFlags,
) => {
  const columnHelper = createColumnHelper<Permission>();
  const base = createBaseColumns<Permission>();
  return [
    /* ================= SELECT ================= */
    base.selectColumn,

    /* ================= NUMBER ================= */
    base.numberColumn,

    /* ================= NAME ================= */
    columnHelper.accessor("name", {
      header: (info) => <SortHeader info={info} title="Name" />,
      size: 260,
      cell: (info) => (
        <span className="font-mono text-sm font-medium">{info.getValue()}</span>
      ),
    }),

    /* ================= RESOURCE ================= */
    columnHelper.accessor("resource", {
      header: (info) => <SortHeader info={info} title="Resource" />,
      size: 160,
      cell: (info) => (
        <Badge variant="outline" className="font-mono">
          {info.getValue()}
        </Badge>
      ),
    }),

    /* ================= ACTION ================= */
    columnHelper.accessor("action", {
      header: (info) => <SortHeader info={info} title="Action" />,
      size: 120,
      cell: (info) => (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 shadow-none font-mono">
          {info.getValue()}
        </Badge>
      ),
    }),

    /* ================= DESCRIPTION ================= */
    columnHelper.accessor("description", {
      header: (info) => <SortHeader info={info} title="Description" />,
      size: 280,
      cell: (info) => (
        <span className="text-muted-foreground text-sm">
          {info.getValue() || <span className="italic">—</span>}
        </span>
      ),
    }),

    /* ================= CREATED AT ================= */
    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader info={info} title="Created At" />,
      size: 160,
      cell: (info) =>
        info.getValue()
          ? dayjs(info.getValue()).format("YYYY-MM-DD HH:mm")
          : "—",
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
          {permissions?.canUpdate && actions?.onEdit && (
            <ActionBtn
              tooltipText="Edit"
              icon={<EditIcon size={12} />}
              onClick={() => actions.onEdit!(row.original)}
            />
          )}
          {permissions?.canDelete && actions?.onDelete && (
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

    base.columnControl
  ];
};
