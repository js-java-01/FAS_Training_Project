import { createColumnHelper } from "@tanstack/react-table";
import type { Location } from "@/types/location";
import { LocationStatus } from "@/types/location";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import FilterHeader from "@/components/data_table/FilterHeader";

export type TableActions = {
    onView?: (row: Location) => void;
    onEdit?: (row: Location) => void;
    onDelete?: (row: Location) => void;
};

export const getColumns = (actions?: TableActions) => {
    const columnHelper = createColumnHelper<Location>();

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

        /* ================= NAME ================= */
        columnHelper.accessor("name", {
            header: (info) => <SortHeader info={info} title="Location Name" />,
            size: 200,
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),

        /* ================= ADDRESS ================= */
        columnHelper.accessor("address", {
            header: (info) => <SortHeader info={info} title="Address" />,
            size: 250,
            cell: (info) => (
                <span className="line-clamp-2 text-muted-foreground">
                    {info.getValue() || "-"}
                </span>
            ),
        }),

        /* ================= PROVINCE ================= */
        columnHelper.accessor("provinceName", {
            header: (info) => <SortHeader info={info} title="Province" />,
            size: 150,
        }),

        /* ================= COMMUNE ================= */
        columnHelper.accessor("communeName", {
            header: (info) => <SortHeader info={info} title="Commune" />,
            size: 150,
        }),

        /* ================= STATUS ================= */
        columnHelper.accessor("status", {
            id: "status",
            header: ({ column }) => (
                <FilterHeader
                    column={column}
                    title="Status"
                    selectedValue={column.getFilterValue() as string}
                    onFilterChange={(value) => column.setFilterValue(value || undefined)}
                />
            ),
            size: 120,
            cell: (info) => (
                <Badge
                    className={
                        info.getValue() === LocationStatus.ACTIVE
                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300 shadow-none"
                            : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none"
                    }
                >
                    {info.getValue() === LocationStatus.ACTIVE ? "Active" : "Inactive"}
                </Badge>
            ),
            meta: {
                filterOptions: ["ACTIVE", "INACTIVE"],
                labelOptions: {
                    ACTIVE: "Active",
                    INACTIVE: "Inactive",
                },
                title: "Status",
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true;
                const cellValue = row.getValue(columnId);
                return cellValue === filterValue;
            },
            enableSorting: false,
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
            enableSorting: false,
        }),
    ];
};
