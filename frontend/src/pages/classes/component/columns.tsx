import ActionBtn from "@/components/data_table/ActionBtn";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import { ROLES } from "@/types/role";
import type { TraineeDetailsResponse } from "@/types/trainerClass";
import { createColumnHelper } from "@tanstack/table-core";
import { EyeIcon, Trash } from "lucide-react";
export type TableActions = {
    onView?: (row: TraineeDetailsResponse) => void;
    onDelete?: (row: TraineeDetailsResponse) => void;
    role?: string;
};
export const getColumns = (actions?: TableActions) => {
    const columnHelper = createColumnHelper<TraineeDetailsResponse>();
    const base = createBaseColumns<TraineeDetailsResponse>();

    const columns = [
        base.selectColumn,
        base.numberColumn,
        columnHelper.accessor("firstName", {
            header: "Full Name",
            cell: (info) => (
                <span className="font-semibold">
                    {info.row.original.firstName} {info.row.original.lastName}
                </span>
            ),
            meta: { title: "Full Name" }
        }),
        columnHelper.accessor("email", {
            header: "Email",
            meta: { title: "Email" }
        }),
    ];

    if (actions?.role !== ROLES.STUDENT) {
        columns.push(
            columnHelper.display({
                id: "actions",
                header: "Actions",
                size: 120,
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <ActionBtn
                            tooltipText="View"
                            icon={<EyeIcon size={12} />}
                            onClick={() => actions?.onView?.(row.original)}
                        />
                        <ActionBtn
                            tooltipText="Delete"
                            icon={<Trash size={12} />}
                            onClick={() => actions?.onDelete?.(row.original)}
                        />
                    </div>
                ),
                enableSorting: false,
                meta: { title: "Actions" }
            })
        );
    }

    columns.push(base.columnControl);

    return columns;
};
