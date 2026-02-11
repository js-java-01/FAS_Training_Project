import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import type { QuestionCategory } from "../../types/questionCategory";
import { Badge } from "@/components/ui/badge";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import SortHeader from "../../components/data_table/SortHeader";

export type QuestionCategoryTableActions = {
    onView?: (row: QuestionCategory) => void;
    onEdit?: (row: QuestionCategory) => void;
    onDelete?: (row: QuestionCategory) => void;
};

const getBadgeStyle = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('technical')) return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100';
    if (lowerName.includes('coding')) return 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100';
    if (lowerName.includes('theory')) return 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100';
    if (lowerName.includes('practical')) return 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100';
    if (lowerName.includes('logic')) return 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100';
    return 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100';
};

export const getColumns = (
    actions?: QuestionCategoryTableActions
) => {
    const columnHelper = createColumnHelper<QuestionCategory>();

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
            header: "Actions",
            size: 100,
            cell: ({ row }) => (
                <div className="flex gap-2 justify-center">
                    <ActionBtn
                        icon={<Eye size={16} />}
                        onClick={() => actions?.onView?.(row.original)}
                        tooltipText="View"
                    />

                    <PermissionGate permission="QUESTION_UPDATE">
                        <ActionBtn
                            icon={<SquarePen size={16} />}
                            onClick={() => actions?.onEdit?.(row.original)}
                            tooltipText="Edit"
                        />
                    </PermissionGate>

                    <PermissionGate permission="QUESTION_DELETE">
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
