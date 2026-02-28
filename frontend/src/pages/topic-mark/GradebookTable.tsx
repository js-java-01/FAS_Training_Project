import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { mockGradebookResponse } from "./mockGradebookData"
import { buildGradebookColumns, type GradebookRow } from "./columns"
import { DataTable } from "@/components/data_table/DataTable"
import { FacetedFilter } from "@/components/FacedFilter"


export default function GradebookTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  const gradebookData = mockGradebookResponse.data

  const columns = useMemo<ColumnDef<GradebookRow, unknown>[]>(() => {
    return buildGradebookColumns(gradebookData.columns)
  }, [gradebookData.columns])

  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<GradebookRow, unknown>
        columns={columns}
        data={gradebookData.rows.items}

        /* Loading */
        isLoading={false}
        isFetching={false}

        /* Pagination (manual giống bạn) */
        manualPagination
        pageIndex={gradebookData.rows.pagination.page}
        pageSize={gradebookData.rows.pagination.pageSize}
        totalPage={gradebookData.rows.pagination.totalPages}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}

        /* Sorting */
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting

        /* Search */
        isSearch
        manualSearch
        searchPlaceholder="Student name"
        onSearchChange={() => { }}

        facetedFilters={
          <div>
            <FacetedFilter
              title="Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
              value={statusFilter}
              setValue={setStatusFilter}
              multiple={false}
            />
         </div>
        }
      />
    </div>
  )
}
