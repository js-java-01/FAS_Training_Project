import { createColumnHelper } from "@tanstack/react-table";
import type { Module } from "@/types/module";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import { iconMap } from "@/constants/iconMap";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createBaseColumns } from "@/components/data_table/baseColumns";

export type TableActions = {
  onView?: (row: Module) => void;
  onEdit?: (row: Module) => void;
  onDelete?: (row: Module) => void;
};

interface PermissionFlags {
  canUpdate?: boolean;
  canDelete?: boolean;
}


export const getColumns = (
  actions?: TableActions,
  permissions?: PermissionFlags
) => {
  const columnHelper = createColumnHelper<Module>();
  const base = createBaseColumns<Module>();

  return [
    /* ================= SELECT ================= */
    base.selectColumn,

    /* ================= NUMBER ================= */
    base.numberColumn,

    /* ================= NAME ================= */
    columnHelper.accessor("title", {
      header: (info) => <SortHeader info={info} title="Name" />,
      size: 200,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      meta: {
        title: "Name"
      }
    }),

    /* ================= URL ================= */
    columnHelper.accessor("url", {
      header: (info) => <SortHeader info={info} title="Url" />,
      size: 200,
      meta: {
        title: "Url"
      }
    }),

    /* ================= MODULE GROUP NAME ================= */
    columnHelper.accessor("moduleGroupName", {
      header: (info) => <SortHeader info={info} title="Module Group Name" />,
      size: 300,
      cell: (info) => (
        <Badge variant="outline">{info.getValue()}</Badge>
      ),
      meta: {
        title: "Module Group Name"
      }
    }),

    /* ================= ICON ================= */
    columnHelper.accessor("icon", {
      header: (info) => <SortHeader info={info} title="Icon" />,
      size: 200,
      cell: (info) => {
        const key = info.getValue();
        if (!key || !(key in iconMap)) return null;
        const Icon = iconMap[key as keyof typeof iconMap];
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {key}
          </div>
        );
      },
      meta: {
        title: "Icon"
      }
    }),

    /* ================= DISPLAY ORDER ================= */
    columnHelper.accessor("displayOrder", {
      header: (info) => <SortHeader info={info} title="Display Order" />,
      size: 100,
      cell: (info) => (
        <span className="block text-center">{info.getValue()}</span>
      ),
      meta: {
        title: "Display Order"
      }
    }),

    /* ================= STATUS ================= */
    columnHelper.accessor("isActive", {
      header: (info) => <SortHeader info={info} title="Status" />,
      size: 120,
      cell: (info) => (
        <Badge
          className={
            info.getValue()
              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300 shadow-none"
              : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none"
          }
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
      meta: {
        title: "Status"
      }
    }),

    /* ================= CREATED AT ================= */
    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader info={info} title="Created At" />,
      size: 160,
      cell: (info) => dayjs(info.getValue()).format("YYYY-MM-DD HH:mm"),
      meta: {
        title: "Created At"
      }
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
      meta: {
        title: "Actions"
      }
    }),
    /* ================= COLUMN CONTROL ================= */
    base.columnControl,
  ];
};
