import {
  type ColumnDef,
  createColumnHelper,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import SortHeader from "@/components/data_table/SortHeader"

/**
 * =========================
 * Row Type
 * =========================
 */
export interface GradebookRow {
  userId: string
  fullName: string
  values: Record<string, number | boolean | null>
}

/**
 * =========================
 * Column Meta From API
 * =========================
 */
export interface GradebookColumnMeta {
  key: string
  label: string
  assessmentTypeId: string | null
  assessmentTypeName: string | null
  weight: number | null
  gradingMethod: string | null
  columnIndex: number | null
}

const columnHelper = createColumnHelper<GradebookRow>()

/**
 * =========================
 * Build Columns
 * =========================
 */
export const buildGradebookColumns = (
  apiColumns: GradebookColumnMeta[]
): ColumnDef<GradebookRow>[] => {
  const sortedColumns = [...apiColumns].sort(
    (a, b) => (a.columnIndex ?? 999) - (b.columnIndex ?? 999)
  )

  return [
    /**
     * Select column
     */
    columnHelper.display({
      id: "select",
      size: 50,
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
      enableSorting: false,
    }),

    /**
     * Row number
     */
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
    }),

    /**
     * Student Name (sortable)
     */
     columnHelper.accessor("fullName", {
       header: (info) => <SortHeader title="Name" info={info} />,
       size: 200,
       cell: (info) => (
         <span className="font-medium">{info.getValue()}</span>
       ),
     }),

    /**
     * Dynamic Columns
     */
    ...sortedColumns.map((col) =>
      columnHelper.display({
        id: col.key,

        header: (info) => (
          <SortHeader info={info} title={col.label} />
        ),

        cell: ({ row }) => {
          const value = row.original.values?.[col.key]

          if (value === null || value === undefined)
            return "-"

          if (typeof value === "boolean") {
            return value ? (
              <span className="text-green-600 font-medium">
                Passed
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                Failed
              </span>
            )
          }

          if (typeof value === "number") {
            return value.toFixed(2)
          }

          return value
        },

        enableSorting: true,

        /**
         * Custom sorting function
         */
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.values?.[col.key]
          const b = rowB.original.values?.[col.key]

          if (a == null) return -1
          if (b == null) return 1

          if (typeof a === "number" && typeof b === "number") {
            return a - b
          }

          if (typeof a === "boolean" && typeof b === "boolean") {
            return Number(a) - Number(b)
          }

          return String(a).localeCompare(String(b))
        },
      })
    ),
  ]
}
