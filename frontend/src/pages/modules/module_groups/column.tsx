import { createColumnHelper} from "@tanstack/react-table";
import type { ModuleGroup } from "@/types/module";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader.tsx";
import FilterHeader from "@/components/data_table/FilterHeader.tsx";

export type TableActions = {
  onView?: (row: ModuleGroup) => void;
  onEdit?: (row: ModuleGroup) => void;
  onDelete?: (row: ModuleGroup) => void;
};

export const getColumns = (actions?: TableActions) => {
  const columnHelper = createColumnHelper<ModuleGroup>();

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

        /* ================= NAME ================= */
        columnHelper.accessor("name", {
            header: (info) => <SortHeader title="Name" info={info} />,
            size: 200,
            cell: (info) => (
                <span className="font-medium">{info.getValue()}</span>
            ),
            meta: {
                title: "Name",
            },
        }),

        /* ================= DESCRIPTION ================= */
        columnHelper.accessor("description", {
            header: (info) => <SortHeader title="Description" info={info} />,
            size: 300,
            cell: (info) => (
                <span className="text-muted-foreground line-clamp-2">
          {info.getValue() || "-"}
        </span>
      ),
      meta: { title: "Description" },
    }),

        /* ================= DISPLAY ORDER ================= */
        columnHelper.accessor("totalModules", {
            header: (info) => <SortHeader title="Total Modules" info={info} />,
            size: 80,
            cell: (info) => (
                <span className="block text-center">
          {info.getValue()}
        </span>
      ),
      meta: { title: "Display Order" },
    }),

        /* ================= STATUS (Xanh lá) ================= */
        columnHelper.accessor("isActive", {
        id: "isActive",
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
                info.getValue()
                ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 hover:border-green-300 shadow-none"
                : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 shadow-none"
            }
            >
            {info.getValue() ? "Active" : "In Active"}
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
            const cellValue = row.getValue(columnId) ? "ACTIVE" : "INACTIVE";
            return cellValue === filterValue;
        },
        enableSorting: false,
        }),

        /* ================= CREATED AT ================= */
        columnHelper.accessor("createdAt", {
            header: (info) => <SortHeader title="Created At" info={info} />,
            size: 160,
            cell: (info) =>
                dayjs(info.getValue()).format("HH:mm DD-MM-YYYY"),
            meta: {
                title: "Created At",
            }
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
      meta: { title: "Actions" },
      enableSorting: false,
    }),
  ];
};
