import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import type { QuestionTag } from "../../types/questionTag";
import { Badge } from "@/components/ui/badge";
import { Eye, SquarePen, Trash2, Hash } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import SortHeader from "../../components/data_table/SortHeader";

export type QuestionTagTableActions = {
    onView?: (row: QuestionTag) => void;
    onEdit?: (row: QuestionTag) => void;
    onDelete?: (row: QuestionTag) => void;
};

const getTagBadgeStyle = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('oop') || lowerName.includes('object')) return 'bg-blue-50 text-blue-600 border-blue-200';
    if (lowerName.includes('algorithm')) return 'bg-green-50 text-green-600 border-green-200';
    if (lowerName.includes('security')) return 'bg-red-50 text-red-600 border-red-200';
    if (lowerName.includes('database') || lowerName.includes('sql')) return 'bg-purple-50 text-purple-600 border-purple-200';
    if (lowerName.includes('api') || lowerName.includes('rest')) return 'bg-cyan-50 text-cyan-600 border-cyan-200';
    if (lowerName.includes('testing')) return 'bg-orange-50 text-orange-600 border-orange-200';
    if (lowerName.includes('async')) return 'bg-pink-50 text-pink-600 border-pink-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
};

export const getColumns = (
    actions?: QuestionTagTableActions
) => {
    const columnHelper = createColumnHelper<QuestionTag>();

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

        /* ================= ID ================= */
        columnHelper.accessor("id", {
            id: "id",
            header: (info) => <SortHeader info={info} title="ID" />,
            size: 80,
            cell: (info) => (
                <span className="text-gray-600 font-mono text-sm">
                    #{info.getValue()}
                </span>
            ),
        }),

        /* ================= TAG NAME ================= */
        columnHelper.accessor("name", {
            id: "name",
            header: (info) => <SortHeader info={info} title="Tag Name" />,
            size: 200,
            cell: (info) => (
                <Badge
                    className={`font-medium border shadow-none ${getTagBadgeStyle(info.getValue())}`}
                    variant="outline"
                >
                    <Hash className="h-3 w-3 mr-1" />
                    {info.getValue()}
                </Badge>
            ),
        }),

        /* ================= DESCRIPTION ================= */
        columnHelper.accessor("description", {
            header: (info) => <SortHeader info={info} title="Description" />,
            size: 350,
            cell: (info) => (
                <span className="text-gray-600 truncate block max-w-[350px]" title={info.getValue() || ''}>
                    {info.getValue() || '-'}
                </span>
            ),
        }),

        /* ================= CREATED DATE ================= */
        columnHelper.accessor("createdAt", {
            header: (info) => <SortHeader info={info} title="Created" />,
            size: 150,
            cell: (info) => {
                const date = info.getValue();
                return date ? (
                    <span className="text-gray-600 text-sm">
                        {new Date(date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </span>
                ) : '-';
            },
        }),

        /* ================= ACTIONS ================= */
        columnHelper.display({
            id: "actions",
            size: 120,
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const tag = row.original;
                return (
                    <div className="flex items-center justify-center gap-2">
                        <ActionBtn
                            icon={<Eye size={16} />}
                            onClick={() => actions?.onView?.(tag)}
                            tooltipText="View Details"
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                        />
                        <PermissionGate permission="QUESTION_UPDATE">
                            <ActionBtn
                                icon={<SquarePen size={16} />}
                                onClick={() => actions?.onEdit?.(tag)}
                                tooltipText="Edit Tag"
                                className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                            />
                        </PermissionGate>
                        <PermissionGate permission="QUESTION_DELETE">
                            <ActionBtn
                                icon={<Trash2 size={16} />}
                                onClick={() => actions?.onDelete?.(tag)}
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                tooltipText="Delete Tag"
                            />
                        </PermissionGate>
                    </div>
                );
            },
        }),
    ];
};
