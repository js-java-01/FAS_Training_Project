import { createColumnHelper } from "@tanstack/react-table";
import type { Permission } from "@/types/permission";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import dayjs from "dayjs";

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
    }),

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
  ];
};
