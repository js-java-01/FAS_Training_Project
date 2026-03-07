import {
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table"
import SortHeader from "@/components/data_table/SortHeader"
import { Badge } from "@/components/ui/badge"
import type {
  GradebookColumnMeta,
  GradebookRow,
} from "@/types/topicMark"
import { EditableGradeCell } from "./EditableGradeCell"
import { createBaseColumns } from "@/components/data_table/baseColumns"

export const buildGradebookColumns = (
  metaColumns: GradebookColumnMeta[],
  isEditing: boolean
): ColumnDef<GradebookRow, any>[] => {
  const columnHelper = createColumnHelper<GradebookRow>()
  const base = createBaseColumns<GradebookRow>()
  const baseColumns: ColumnDef<GradebookRow, any>[] = [
    base.selectColumn,

    base.numberColumn,

    columnHelper.accessor("fullName", {
      size: 220,
      header: (info) => (
        <SortHeader info={info} title="Student Name" />
      ),
      cell: (info) => (
        <span>
          {info.getValue()}
        </span>
      ),
      meta: {
        title: "Student Name",
      },
    }),
    columnHelper.accessor("email", {
      size: 220,
      header: (info) => (
        <SortHeader info={info} title="Student Email" />
      ),
      cell: (info) => (
        <Badge variant={"outline"}>
          {info.getValue()}
        </Badge>
      ),
      meta: {
        title: "Student Email",
      },
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
          const isMetaColumn = col.key === "FINAL_SCORE" || col.key === "IS_PASSED"

          if (
            isEditing &&
            !isMetaColumn &&
            value !== true &&
            value !== false
          ) {
            const rowData = info.row.original

            return (
              <EditableGradeCell
                value={value ?? null}
                topicId={rowData.topicId}
                trainingClassId={rowData.trainingClassId}
                userId={rowData.userId}
                columnId={col.key}
                isTableEditing={isEditing}
              />
            )
          }

          if (value == null)
            return (
              <span className="text-muted-foreground flex items-center justify-center">
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
              {typeof value === "number"
                ? Number(value).toFixed(2)
                : value}
            </span>
          )
        },
        meta: {
          title: col.label,
        },
      }
    )
  )

  return [...baseColumns, ...dynamicColumns, base.columnControl]
}
