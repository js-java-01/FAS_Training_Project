import { createColumnHelper } from "@tanstack/react-table";
import type { TrainingProgram } from "@/types/trainingProgram";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EyeIcon, Trash } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";

export type ProgramTableActions = {
  onView?: (row: TrainingProgram) => void;
  onDelete?: (row: TrainingProgram) => void;
};

export const getColumns = (actions?: ProgramTableActions) => {
  const columnHelper = createColumnHelper<TrainingProgram>();

  return [
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

    columnHelper.accessor("name", {
      header: (info) => <SortHeader title="Program Name" info={info} />,
      size: 240,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),

    columnHelper.accessor("version", {
      header: (info) => <SortHeader title="Version" info={info} />,
      size: 100,
      cell: (info) => <span>{info.getValue()}</span>,
    }),

    columnHelper.accessor("description", {
      header: (info) => <SortHeader title="Description" info={info} />,
      size: 340,
      cell: (info) => (
        <span className="text-muted-foreground line-clamp-2">
          {info.getValue() || "-"}
        </span>
      ),
    }),

    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader title="Created At" info={info} />,
      size: 180,
      cell: (info) => dayjs(info.getValue()).format("HH:mm DD-MM-YYYY"),
    }),

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
              onClick={() => actions.onView?.(row.original)}
            />
          )}
          {actions?.onDelete && (
            <ActionBtn
              tooltipText="Delete"
              icon={<Trash size={12} />}
              onClick={() => actions.onDelete?.(row.original)}
            />
          )}
        </div>
      ),
      enableSorting: false,
    }),
  ];
};
