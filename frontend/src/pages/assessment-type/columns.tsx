import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Badge } from "@/components/ui/badge";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import SortHeader from "../../components/data_table/SortHeader";
import type { AssessmentType } from "@/types";

export type AssessmentTableActions = {
    onView?: (row: AssessmentType) => void;
    onEdit?: (row: AssessmentType) => void;
    onDelete?: (row: AssessmentType) => void;
};

export type AssessmentTableContext = {
    page?: number;
    pageSize?: number;
};

const getBadgeStyle = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('test')) return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100';
    if (lowerName.includes('assignment')) return 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100';
    if (lowerName.includes('challenge')) return 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100';
    if (lowerName.includes('interview')) return 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100';
    if (lowerName.includes('exam')) return 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100';
    return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100';
};

export const getColumns = (
    actions?: AssessmentTableActions,
    context?: AssessmentTableContext
) => {
    const columnHelper = createColumnHelper<AssessmentType>();

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
            id: "no",
            size: 60,
            header: () => <div className="text-center font-semibold">No.</div>,
            cell: ({ row }) => {
                const pageNumber = context?.page ?? 0;
                const pageSize = context?.pageSize ?? 10;
                const rowIndex = row.index;
                const position = pageNumber * pageSize + rowIndex + 1;

                return (
                    <div className="text-center font-medium text-gray-700">
                        {position}
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
        }),

        /* ================= NAME ================= */
        columnHelper.accessor("name", {
            id: "name",
            header: (info) => <SortHeader info={info} title="Name" />,
            size: 200,
            cell: (info) => (
                <Badge
                    className={`font-medium border shadow-none ${getBadgeStyle(info.getValue())}`}
                    variant="outline"
                >
                    {info.getValue()}
                </Badge>
            ),
        }),

        /* ================= DESCRIPTION ================= */
        columnHelper.accessor("description", {
            header: (info) => <SortHeader info={info} title="Description" />,
            size: 300,
            cell: (info) => (
                <span className="text-gray-600 truncate block max-w-[300px]" title={info.getValue() || ''}>
                    {info.getValue() || '-'}
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
            header: () => <div className="text-center font-semibold">Actions</div>,
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
