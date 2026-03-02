import { createColumnHelper } from "@tanstack/react-table";
import type { Module } from "@/types/module";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import { iconMap } from "@/constants/iconMap";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";

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
    columnHelper.accessor("title", {
      header: (info) => <SortHeader info={info} title="Name" />,
      size: 200,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),

    /* ================= URL ================= */
    columnHelper.accessor("url", {
      header: (info) => <SortHeader info={info} title="Url" />,
      size: 200,
    }),

    /* ================= MODULE GROUP NAME ================= */
    columnHelper.accessor("moduleGroupName", {
      header: (info) => <SortHeader info={info} title="Module Group Name" />,
      size: 300,
      cell: (info) => (
        <Badge variant="outline">{info.getValue()}</Badge>
      ),
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
    }),

    /* ================= DISPLAY ORDER ================= */
    columnHelper.accessor("displayOrder", {
      header: (info) => <SortHeader info={info} title="Display Order" />,
      size: 100,
      cell: (info) => (
        <span className="block text-center">{info.getValue()}</span>
      ),
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
    }),

    /* ================= CREATED AT ================= */
    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader info={info} title="Created At" />,
      size: 160,
      cell: (info) => dayjs(info.getValue()).format("YYYY-MM-DD HH:mm"),
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
