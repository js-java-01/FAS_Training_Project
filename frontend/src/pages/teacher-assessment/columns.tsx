import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import type { Assessment } from "@/types/feature/assessment/assessment";
import { Badge } from "@/components/ui/badge";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import SortHeader from "../../components/data_table/SortHeader";

export type AssessmentTableActions = {
    onView?: (row: Assessment) => void;
    onEdit?: (row: Assessment) => void;
    onDelete?: (row: Assessment) => void;
};

const getStatusBadgeStyle = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100';
        case 'INACTIVE':
            return 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100';
        case 'DRAFT':
            return 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100';
        default:
            return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100';
    }
};

export const getColumns = (
    actions?: AssessmentTableActions
) => {
    const columnHelper = createColumnHelper<Assessment>();

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

        /* ================= CODE ================= */
        columnHelper.accessor("code", {
            id: "code",
            header: (info) => <SortHeader info={info} title="Code" />,
            size: 120,
            cell: (info) => (
                <span className="font-mono text-sm text-gray-700">
                    {info.getValue()}
                </span>
            ),
        }),

        /* ================= TITLE ================= */
        columnHelper.accessor("title", {
            id: "title",
            header: (info) => <SortHeader info={info} title="Title" />,
            size: 200,
            cell: (info) => (
                <span className="font-medium text-gray-900">
                    {info.getValue()}
                </span>
            ),
        }),

        /* ================= TYPE ================= */
        columnHelper.accessor("assessmentTypeName", {
            header: (info) => <SortHeader info={info} title="Type" />,
            size: 150,
            cell: (info) => (
                <span className="text-gray-600">
                    {info.getValue() || '-'}
                </span>
            ),
        }),

        /* ================= STATUS ================= */
        columnHelper.accessor("status", {
            id: "status",
            header: (info) => <SortHeader info={info} title="Status" />,
            size: 120,
            cell: (info) => (
                <Badge
                    className={`font-medium border shadow-none ${getStatusBadgeStyle(info.getValue())}`}
                    variant="outline"
                >
                    {info.getValue()}
                </Badge>
            ),
        }),

        /* ================= SCORE ================= */
        columnHelper.display({
            id: "score",
            header: "Score",
            size: 120,
            cell: ({ row }) => (
                <span className="text-gray-700">
                    {row.original.passScore}/{row.original.totalScore}
                </span>
            ),
        }),

        /* ================= TIME LIMIT ================= */
        columnHelper.accessor("timeLimitMinutes", {
            header: (info) => <SortHeader info={info} title="Time (min)" />,
            size: 100,
            cell: (info) => (
                <span className="text-gray-600">
                    {info.getValue()}
                </span>
            ),
        }),

        /* ================= ATTEMPTS ================= */
        columnHelper.accessor("attemptLimit", {
            header: (info) => <SortHeader info={info} title="Attempts" />,
            size: 100,
            cell: (info) => (
                <span className="text-gray-600">
                    {info.getValue()}
                </span>
            ),
        }),

        /* ================= CREATED AT ================= */
        columnHelper.accessor("createdAt", {
            header: (info) => <SortHeader info={info} title="Created At" />,
            size: 130,
            cell: (info) => {
                const date = info.getValue();
                if (!date) return '-';
                return new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                });
            },
        }),

        /* ================= ACTIONS ================= */
        columnHelper.display({
            id: "actions",
            header: "Actions",
            size: 100,
            cell: ({ row }) => (
                <div className="flex gap-2 justify-center">
                    <ActionBtn
                        icon={<Eye size={16} />}
                        onClick={() => actions?.onView?.(row.original)}
                        tooltipText="View"
                    />

                    <PermissionGate permission="ASSESSMENT_UPDATE">
                        <ActionBtn
                            icon={<SquarePen size={16} />}
                            onClick={() => actions?.onEdit?.(row.original)}
                            tooltipText="Edit"
                        />
                    </PermissionGate>

                    <PermissionGate permission="ASSESSMENT_DELETE">
                        <ActionBtn
                            icon={<Trash2 size={16} />}
                            onClick={() => actions?.onDelete?.(row.original)}
                            className="hover:text-red-500 hover:border-red-500"
                            tooltipText="Delete"
                        />
                    </PermissionGate>
                </div>
            ),
        }),
    ];
};
