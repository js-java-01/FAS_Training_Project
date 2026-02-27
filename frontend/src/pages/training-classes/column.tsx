import { createColumnHelper } from "@tanstack/react-table";
import type { TrainingClass } from "@/types/trainingClass";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Check, EyeIcon, X } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";

export type TableActions = {
    onNavigate?: (row: TrainingClass) => void;
    onApprove?: (row: TrainingClass) => void;
    onReject?: (row: TrainingClass) => void;
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
        columnHelper.accessor("status", {
            header: (info) => <SortHeader info={info} title="Status" />,
            size: 120,
            cell: ({ getValue, row }) => {
                const status = getValue() as string;
                const isActive = row.original.isActive;

                let badgeClass = "bg-gray-100 text-gray-700 border-gray-200";
                let label = status;

                // Handle legacy or mapped statuses
                if (status === "APPROVED") {
                    if (isActive) {
                        badgeClass = "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 shadow-none";
                        label = "Active";
                    } else {
                         // Approved but future -> Planning / Scheduled? or just Approved
                        badgeClass = "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 shadow-none";
                        label = "Approved (Inactive)";
                    }
                } else if (status === "PENDING_APPROVAL") {
                    badgeClass = "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 shadow-none";
                    label = "Pending";
                } else if (status === "REJECTED") {
                    badgeClass = "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none";
                    label = "Rejected";
                }

                return (
                    <Badge className={badgeClass}>
                        {label}
                    </Badge>
                );
            },
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
                    {row.original.status === "PENDING_APPROVAL" && actions?.onApprove && (
                        <ActionBtn
                            tooltipText="Approve"
                            icon={<Check size={12} />}
                            onClick={() => actions.onApprove!(row.original)}
                        />
                    )}
                    {row.original.status === "PENDING_APPROVAL" && actions?.onReject && (
                        <ActionBtn
                            tooltipText="Reject"
                            icon={<X size={12} />}
                            onClick={() => actions.onReject!(row.original)}
                        />
                    )}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        }),
    ];
};
