import {createColumnHelper} from "@tanstack/react-table";
import type {Menu} from "@/types/menu";
import {Badge} from "@/components/ui/badge";
import ActionBtn from "@/components/data_table/ActionBtn.tsx";
import {EditIcon, EyeIcon, Trash} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export const getColumns = () => {
    const columnHelper = createColumnHelper<Menu>();

    return [
        columnHelper.display({
            id: "select",
            size: 50,
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) =>
                        row.toggleSelected(!!value)
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
            cell: ({row, table}) =>
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
        }),

        /* ================= DISPLAY ORDER ================= */
        columnHelper.accessor("displayOrder", {
            header: "Order",
            size: 80,
            cell: (info) => (
                <span className="text-center block">
                    {info.getValue()}
                </span>
            ),
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
        }),

        /* ================= CREATED AT ================= */
        columnHelper.accessor("createdAt", {
            header: "Created At",
            size: 160,
            cell: (info) =>
                new Date(info.getValue()).toLocaleDateString(),
        }),

        /* ================= ACTIONS ================= */
        columnHelper.display({
            id: "actions",
            header: "Actions",
            size: 120,
            cell: ({row}) => {
                const menu = row.original;

                return (
                    <div className="flex gap-2">
                        <ActionBtn
                            tooltipText={"View"}
                            icon={<EyeIcon size={12} />}
                            onClick={() => console.log("View", menu.id)}
                        />
                        <ActionBtn
                            tooltipText={"Edit"}
                            icon={<EditIcon size={12} />}
                            onClick={() => console.log("Edit", menu.id)}
                        />
                        <ActionBtn
                            tooltipText={"Delete"}
                            icon={<Trash size={12} />}
                            onClick={() => console.log("Delete", menu.id)}
                        />

                    </div>
                );
            },
            enableSorting: false,
        }),
    ];
};
