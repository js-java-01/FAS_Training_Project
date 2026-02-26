import { createColumnHelper } from "@tanstack/react-table";
import type { TrainingClass } from "@/types/trainingClass";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Check, EditIcon, EyeIcon, X } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";

export type TableActions = {
    onNavigate?: (row: TrainingClass) => void;
};

export const getColumns = (actions?: TableActions) => {
    const columnHelper = createColumnHelper<TrainingClass>();

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

        /* ================= CLASS NAME ================= */
        columnHelper.accessor("className", {
            header: (info) => <SortHeader title="Class Name" info={info} />,
            size: 200,
            cell: (info) => (
                <span className="font-medium">{info.getValue()}</span>
            ),
            meta: { title: "Class Name" },
        }),

        /* ================= CLASS CODE ================= */
        columnHelper.accessor("classCode", {
            header: (info) => <SortHeader title="Class Code" info={info} />,
            size: 140,
            cell: (info) => (
                <span className="font-mono text-sm">{info.getValue()}</span>
            ),
            meta: { title: "Class Code" },
        }),

        /* ================= SEMESTER ================= */
        columnHelper.accessor("semesterName", {
            header: (info) => <SortHeader title="Semester" info={info} />,
            size: 160,
            cell: (info) => (
                <span className="text-muted-foreground">
                    {info.getValue() || "-"}
                </span>
            ),
            meta: { title: "Semester" },
        }),

        /* ================= CREATOR ================= */
        columnHelper.accessor("creatorName", {
            header: (info) => <SortHeader title="Creator" info={info} />,
            size: 160,
            cell: (info) => (
                <span className="text-muted-foreground">
                    {info.getValue() || "-"}
                </span>
            ),
            meta: { title: "Creator" },
        }),

        /* ================= START DATE ================= */
        columnHelper.accessor("startDate", {
            header: (info) => <SortHeader title="Start Date" info={info} />,
            size: 130,
            cell: (info) =>
                info.getValue()
                    ? dayjs(info.getValue()).format("DD-MM-YYYY")
                    : "-",
            meta: { title: "Start Date" },
        }),

        /* ================= END DATE ================= */
        columnHelper.accessor("endDate", {
            header: (info) => <SortHeader title="End Date" info={info} />,
            size: 130,
            cell: (info) =>
                info.getValue()
                    ? dayjs(info.getValue()).format("DD-MM-YYYY")
                    : "-",
            meta: { title: "End Date" },
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
                            : "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 shadow-none"
                    }
                >
                    {info.getValue() ? "Active" : "Pending"}
                </Badge>
            ),
            meta: { title: "Status" },
        }),

        /* ================= ACTIONS ================= */
        columnHelper.display({
            id: "actions",
            header: "Actions",
            size: 180,
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {actions?.onNavigate && (
                        <ActionBtn
                            tooltipText="View"
                            icon={<EyeIcon size={12} />}
                            onClick={() => actions.onNavigate!(row.original)}
                        />
                    )}
                    <ActionBtn
                        tooltipText="Update"
                        icon={<EditIcon size={12} />}
                        onClick={() => {}}
                    />
                    <ActionBtn
                        tooltipText="Approve"
                        icon={<Check size={12} />}
                        onClick={() => {}}
                    />
                    <ActionBtn
                        tooltipText="Reject"
                        icon={<X size={12} />}
                        onClick={() => {}}
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        }),
    ];
};
