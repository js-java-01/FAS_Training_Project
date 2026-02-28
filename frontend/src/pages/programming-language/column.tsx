import { createColumnHelper } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import type { ProgrammingLanguage } from "../../types/programmingLanguage";
import { Badge } from "@/components/ui/badge";
import { Eye, SquarePen, Trash2 } from "lucide-react";
import { PermissionGate } from "@/components/PermissionGate";
import SortHeader from "../../components/data_table/SortHeader";
import FilterHeader from "@/components/data_table/FilterHeader";

export type ProgrammingLanguageTableActions = {
    onView?: (row: ProgrammingLanguage) => void;
    onEdit?: (row: ProgrammingLanguage) => void;
    onDelete?: (row: ProgrammingLanguage) => void;
};

const getBadgeStyle = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('java')) return 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100';
    if (lowerName.includes('python')) return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100';
    if (lowerName.includes('javascript') || lowerName.includes('typescript')) return 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100';
    if (lowerName.includes('c#') || lowerName.includes('csharp')) return 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100';
    if (lowerName.includes('go')) return 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100';
    if (lowerName.includes('rust')) return 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100';
    return 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100';
};

export const getColumns = (
    actions?: ProgrammingLanguageTableActions
) => {
    const columnHelper = createColumnHelper<ProgrammingLanguage>();

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
            size: 180,
            cell: (info) => (
                <Badge
                    className={`font-medium border shadow-none ${getBadgeStyle(info.getValue())}`}
                    variant="outline"
                >
                    {info.getValue()}
                </Badge>
            ),
        }),

        /* ================= VERSION ================= */
        columnHelper.accessor("version", {
            header: (info) => <SortHeader info={info} title="Version" />,
            size: 100,
            cell: (info) => (
                <span className="text-gray-600">
                    {info.getValue() || '-'}
                </span>
            ),
        }),

        /* ================= DESCRIPTION ================= */
        columnHelper.accessor("description", {
            header: (info) => <SortHeader info={info} title="Description" />,
            size: 280,
            cell: (info) => (
                <span className="text-gray-600 truncate block max-w-[280px]" title={info.getValue() || ''}>
                    {info.getValue() || '-'}
                </span>
            ),
        }),

        /* ================= SUPPORTED STATUS ================= */
        columnHelper.accessor("isSupported", {
            id: "isSupported",
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
                    className={`font-medium border shadow-none ${
                        info.getValue()
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-red-50 text-red-600 border-red-100'
                    }`}
                    variant="outline"
                >
                    {info.getValue() ? 'Supported' : 'Not Supported'}
                </Badge>
            ),
            meta: {
                filterOptions: ["SUPPORTED", "NOT_SUPPORTED"],
                labelOptions: {
                    SUPPORTED: "Supported",
                    NOT_SUPPORTED: "Not Supported",
                },
                title: "Status",
            },
            filterFn: (row, columnId, filterValue) => {
                if (!filterValue) return true;
                const cellValue = row.getValue(columnId) ? "SUPPORTED" : "NOT_SUPPORTED";
                return cellValue === filterValue;
            },
            enableSorting: false,
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

                    <PermissionGate permission="PROGRAMMING_LANGUAGE_UPDATE">
                        <ActionBtn
                            icon={<SquarePen size={16} />}
                            onClick={() => actions?.onEdit?.(row.original)}
                            tooltipText="Edit"
                        />
                    </PermissionGate>

                    <PermissionGate permission="PROGRAMMING_LANGUAGE_DELETE">
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