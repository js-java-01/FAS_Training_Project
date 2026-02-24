import { createColumnHelper } from "@tanstack/react-table";
import type { Role } from "@/types/role";
import { Checkbox } from "@/components/ui/checkbox";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EditIcon, EyeIcon, Trash, ToggleLeft } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import SortHeader from "@/components/data_table/SortHeader";
import FilterHeader from "@/components/data_table/FilterHeader";

export type TableActions = {
  onView?: (row: Role) => void;
  onEdit?: (row: Role) => void;
  onDelete?: (row: Role) => void;
  onToggleStatus?: (id: string) => void;
};

export const getColumns = (actions?: TableActions) => {
  const columnHelper = createColumnHelper<Role>();

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
    }),

    columnHelper.accessor("name", {
      header: (info) => <SortHeader info={info} title="Name" />,
      size: 200,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),

    columnHelper.accessor("description", {
      header: (info) => <SortHeader info={info} title="Description" />,
      size: 300,
      cell: (info) => (
        <span className="line-clamp-2 text-muted-foreground">
          {info.getValue() || "-"}
        </span>
      ),
    }),

    columnHelper.accessor("hierarchyLevel", {
      header: (info) => <SortHeader info={info} title="Hierarchy" />,
      size: 120,
    }),

    columnHelper.accessor("permissionNames", {
      id: "permissions",
      header: "Permissions",
      size: 140,
      cell: (info) => <span>{(info.getValue() as string[])?.length || 0}</span>,
      enableSorting: false,
    }),

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
        labelOptions: { ACTIVE: "Active", INACTIVE: "Inactive" },
        title: "Status",
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = row.getValue(columnId) ? "ACTIVE" : "INACTIVE";
        return cellValue === filterValue;
      },
      enableSorting: false,
    }),

    columnHelper.accessor("createdAt", {
      header: (info) => <SortHeader info={info} title="Created At" />,
      size: 160,
      cell: (info) => dayjs(info.getValue()).format("YYYY-MM-DD HH:mm"),
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 140,
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
          {actions?.onToggleStatus && (
            <ActionBtn
              tooltipText="Toggle"
              icon={<ToggleLeft size={12} />}
              onClick={() => actions.onToggleStatus!(row.original.id)}
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
      enableSorting: false,
    }),
  ];
};
