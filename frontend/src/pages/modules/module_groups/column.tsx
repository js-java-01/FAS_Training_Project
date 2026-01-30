import { createColumnHelper} from "@tanstack/react-table";
import type { Menu } from "@/types/menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";

export type TableActions = {
    onView?: (row: Menu) => void;
    onEdit?: (row: Menu) => void;
    onDelete?: (row: Menu) => void;
};

export const getColumns = (
    actions?: TableActions
) => {
    const columnHelper = createColumnHelper<Menu>();

    return [
        /* ================= SELECT ================= */
        columnHelper.display({
            id: "select",
            size: 50,
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(v) =>
                        table.toggleAllPageRowsSelected(!!v)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) =>
                        row.toggleSelected(!!v)
                    }
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
            header: "Name",
            size: 200,
            cell: (info) => (
                <span className="font-medium">{info.getValue()}</span>
            ),
            meta: {
                title: "Name",
            },
        }),

        /* ================= DESCRIPTION ================= */
        columnHelper.accessor("description", {
            header: "Description",
            size: 300,
            cell: (info) => (
                <span className="text-muted-foreground line-clamp-2">
          {info.getValue() || "-"}
        </span>
            ),
            meta: {
                title: "Description",
            },
        }),

        /* ================= DISPLAY ORDER ================= */
        columnHelper.accessor("displayOrder", {
            header: "Order",
            size: 80,
            cell: (info) => (
                <span className="block text-center">
          {info.getValue()}
        </span>
            ),
            meta: {
                title: "Display Order",
            }
        }),

        /* ================= STATUS ================= */
        columnHelper.accessor("isActive", {
            header: "Status",
            size: 100,
            cell: (info) =>
                info.getValue() ? (
                    <Badge variant="outline">Active</Badge>
                ) : (
                    <Badge variant="destructive">Inactive</Badge>
                ),
            meta: {
                title: "Status",
            }
        }),

        /* ================= CREATED AT ================= */
        columnHelper.accessor("createdAt", {
            header: "Created At",
            size: 160,
            cell: (info) =>
                new Date(info.getValue()).toLocaleDateString(),
        meta: {
                title: "Created At",
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
            meta: {
                title: "Actions",
            },
            enableSorting: false,
        }),
    ];
};
