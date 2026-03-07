import { createColumnHelper } from "@tanstack/react-table";
import type { RoleDTO } from "@/types";
import ActionBtn from "@/components/data_table/ActionBtn";
import {
  EditIcon,
  EyeIcon,
  Trash,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import dayjs from "dayjs";

export type RoleTableActions = {
  onView?: (row: RoleDTO) => void;
  onEdit?: (row: RoleDTO) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (row: RoleDTO) => void;
};

export const getColumns = (actions?: RoleTableActions) => {
  const columnHelper = createColumnHelper<RoleDTO>();
  const base = createBaseColumns<RoleDTO>();

  return [
    /* ================= SELECT ================= */
    base.selectColumn,

    /* ================= NUMBER ================= */
    base.numberColumn,

    /* ================= NAME ================= */
    columnHelper.accessor("name", {
      header: (info) => <SortHeader info={info} title="Name" />,
      size: 200,
      cell: (info) => (
        <span className="font-medium text-sm">{info.getValue()}</span>
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

    /* ================= STATUS ================= */
    columnHelper.accessor("isActive", {
      header: "Status",
      size: 100,
      enableSorting: false,
      cell: (info) =>
        info.getValue() ? (
          <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    }),

    /* ================= PERMISSIONS COUNT ================= */
    columnHelper.accessor("permissionIds", {
      id: "permissionsCount",
      header: "Permissions",
      size: 110,
      enableSorting: false,
      cell: (info) => (
        <Badge variant="secondary" className="font-mono">
          {info.getValue()?.length ?? 0}
        </Badge>
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
      size: 140,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-1">
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
              icon={
                row.original.isActive ? (
                  <ToggleRight size={12} className="text-green-600" />
                ) : (
                  <ToggleLeft size={12} className="text-gray-400" />
                )
              }
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
    }),

    base.columnControl,
  ];
};
