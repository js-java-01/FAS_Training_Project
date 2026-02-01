import { createColumnHelper} from "@tanstack/react-table";
import type { Module} from "@/types/module";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import {EditIcon, EyeIcon, Trash} from "lucide-react";
import {iconMap} from "@/constants/iconMap.ts";
import dayjs from "dayjs";

export type TableActions = {
    onView?: (row: Module) => void;
    onEdit?: (row: Module) => void;
    onDelete?: (row: Module) => void;
};

export const getColumns = (
    actions?: TableActions
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

        /* ================= NAME ================= */
        columnHelper.accessor((row) => row.title || row.name || "", {
            id: "title",
            header: "Name",
            size: 200,
            cell: (info) => (
                <span className="font-medium">{info.getValue()}</span>
            ),
            meta: {
                title: "Name",
            },
        }),

        /* ================= Url ================= */
        columnHelper.accessor("url", {
            header: "Url",
            size: 200,
            cell: (info) => (
                <span className="font-medium">{info.getValue()}</span>
            ),
            meta: {
                title: "Url",
            },
        }),

        /* ================= Icon ================= */
    columnHelper.accessor("icon", {
        header: "Icon",
        size: 200,
        cell: (info) => {
            const iconKey = info.getValue();

            if (!iconKey || !(iconKey in iconMap)) {
                return null; // or render fallback icon
            }

            const Icon = iconMap[iconKey as keyof typeof iconMap];

            return (
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-700" />
                    <span className="font-medium">
        {info.getValue()}
      </span>
                </div>
            );
        },
        meta: {
            title: "Icon",
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

        /* ================= CREATED AT ================= */
        columnHelper.accessor("createdAt", {
            header: "Created At",
            size: 160,
            cell: (info) =>
                dayjs(info.getValue()).format("YYYY-MM-DD HH:mm"),
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
