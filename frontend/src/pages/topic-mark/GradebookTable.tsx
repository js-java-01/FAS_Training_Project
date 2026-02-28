import { useMemo, useState, useEffect } from "react"
import type { SortingState } from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { DataTable } from "@/components/data_table/DataTable"
import { FacetedFilter } from "@/components/FacedFilter"
import { buildGradebookColumns } from "./columns"
import {
  useGetCourseByClassId,
  useGetGradebookTable,
} from "./services/queries"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { GradebookRow } from "@/types/topicMark"
import { SearchableSelect } from "@/components/SearchableSelect"

interface Props {
  classId: string
}

export default function GradebookTable({ classId }: Props) {
  /* ================= STATE ================= */

  const [sorting, setSorting] = useState<SortingState>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearch = useDebounce(searchValue, 300)

  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedCourseClassId, setSelectedCourseClassId] =
    useState("")

  /* ================= COURSE CLASS ================= */

  const { data: courseClasses = [] } =
    useGetCourseByClassId(classId)

  useEffect(() => {
    if (!selectedCourseClassId && courseClasses.length) {
      setSelectedCourseClassId(courseClasses[0].id)
    }
  }, [courseClasses, selectedCourseClassId])

  /* ================= SORT & STATUS PARAM ================= */

  const statusParam =
    statusFilter.length === 1 ? statusFilter[0] === "PASSED" : undefined;

  const sortParam = useMemo(() => {
    if (!sorting.length) return "fullName,asc"
    const { id, desc } = sorting[0]
    return `${id},${desc ? "desc" : "asc"}`
  }, [sorting])

  /* ================= GRADEBOOK QUERY ================= */

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetGradebookTable({
    id: selectedCourseClassId,
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
    passed: statusParam,
    enabled: !!selectedCourseClassId,
  })

  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch, statusFilter, selectedCourseClassId])

  /* ================= SAFE DATA ================= */

  const safeTableData = useMemo(() => {
    const rows = tableData?.data?.rows

    return {
      items: (rows?.items ?? []) as GradebookRow[],
      page: rows?.pagination?.page ?? pageIndex,
      pageSize: rows?.pagination?.pageSize ?? pageSize,
      totalPages: rows?.pagination?.totalPages ?? 0,
      columns: tableData?.data?.columns ?? [],
    }
  }, [tableData, pageIndex, pageSize])

  /* ================= COLUMNS ================= */

  const columns = useMemo(
    () => buildGradebookColumns(safeTableData.columns),
    [safeTableData.columns]
  )

  /* ================= RENDER ================= */
  const courseOptions = courseClasses.map((cc) => ({
    value: cc.id,
    label: cc.course.courseCode,
    raw: cc,
  }))

  return (
    <div className="relative space-y-4 h-[calc(100%-90px)] flex-1">
      {/* Dropdown */}
      <SearchableSelect
        label="Course Code"
        value={selectedCourseClassId}
        onChange={(val) => setSelectedCourseClassId(val)}
        options={courseOptions}
        renderOption={(option) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {option.raw?.course.courseCode}
            </span>
            <span className="text-xs text-muted-foreground">
              {option.raw?.course.courseName}
            </span>
          </div>
        )}
      />

      <DataTable<GradebookRow, unknown>
        columns={columns}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        manualPagination
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        manualSearch
        searchPlaceholder="Student name"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        facetedFilters={
          <FacetedFilter
            title="Status"
            options={[
              { value: "PASSED", label: "Passed" },
              { value: "FAIL", label: "Fail" },
            ]}
            value={statusFilter}
            setValue={setStatusFilter}
            multiple={false}
          />
        }
      />
    </div>
  )
}
