import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import SortHeader from "@/components/data_table/SortHeader"
import { Badge } from "@/components/ui/badge"
import type {
  GradebookColumnMeta,
  GradebookRow,
} from "@/types/topicMark"

export const buildGradebookColumns = (
  metaColumns: GradebookColumnMeta[]
): ColumnDef<GradebookRow, any>[] => {
  const columnHelper = createColumnHelper<GradebookRow>()

  const baseColumns: ColumnDef<GradebookRow, any>[] = [
    columnHelper.display({
      id: "select",
      size: 50,
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(v) =>
            table.toggleAllPageRowsSelected(!!v)
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) =>
            row.toggleSelected(!!v)
          }
        />
      ),
    }),

    columnHelper.display({
      id: "number",
      header: "#",
      size: 60,
      enableSorting: false,
      cell: ({ row, table }) =>
        row.index +
        1 +
        table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize,
    }),

    columnHelper.accessor("fullName", {
      size: 220,
      header: (info) => (
        <SortHeader info={info} title="Student Name" />
      ),
      cell: (info) => (
        <span className="font-medium">
          {info.getValue()}
        </span>
      ),
    }),
  ]

  const dynamicColumns = metaColumns.map((col) =>
    columnHelper.accessor(
      (row) => row.values[col.key],
      {
        id: col.key,
        size: 120,
        header: (info) => (
          <div className="flex flex-col items-center text-center">
            <SortHeader info={info} title={col.label} />
            {col.weight && (
              <span className="text-xs text-muted-foreground">
                {col.weight}%
              </span>
            )}
          </div>
        ),
        cell: (info) => {
          const value = info.getValue()

          if (value == null)
            return (
              <span className="text-muted-foreground">
                -
              </span>
            )

          if (typeof value === "boolean") {
            return (
              <Badge
                className={
                  value
                    ? "bg-green-100 text-green-700 border-green-200 shadow-none"
                    : "bg-red-100 text-red-700 border-red-200 shadow-none"
                }
              >
                {value ? "Pass" : "Fail"}
              </Badge>
            )
          }

          return (
            <span className="text-center block">
              {value}
            </span>
          )
        },
      }
    )
  )

  return [...baseColumns, ...dynamicColumns]
}
