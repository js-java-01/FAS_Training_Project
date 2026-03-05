import { useMemo, useState, useEffect } from "react"
import type { SortingState } from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { DataTable } from "@/components/data_table/DataTable"
import { FacetedFilter } from "@/components/FacedFilter"
import { buildGradebookColumns } from "./columns"
import {
  useGetClassCourseById,
  useGetCoursesByClassId,
  useGetGradebookTable,
} from "./services/queries"
import type { GradebookRow } from "@/types/topicMark"
import { SearchableSelect } from "@/components/SearchableSelect"
import { useSortParam } from "@/hooks/useSortParam"
import { Button } from "@/components/ui/button"
import { Edit, HistoryIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import GradeHistorySheet from "./GradeHistorySheet"
import EntityImportExportButton from "@/components/modal/import-export/EntityImportExportBtn"
import { useExportTemplate, useExportTopicMarks, useImportTopicMarks } from "./services/mutations"
import { useRoleSwitch } from "@/contexts/RoleSwitchContext"
import { ROLES } from "@/types/role"

interface Props {
  classId: string
}

export default function GradebookTable({ classId }: Props) {
  const { activeRole } = useRoleSwitch();
  /* ================= STATE ================= */
  const [isEditing, setIsEditing] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const [sorting, setSorting] = useState<SortingState>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearch = useDebounce(searchValue, 300)

  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedCourseClassId, setSelectedCourseClassId] =
    useState("")

  /* ================= COURSE CLASS ================= */

  const { data: classCourse } = useGetClassCourseById(selectedCourseClassId)

  const { data: courseClasses = [] } =
    useGetCoursesByClassId(classId)

  useEffect(() => {
    if (!selectedCourseClassId && courseClasses.length) {
      setSelectedCourseClassId(courseClasses[0].id)
    }
  }, [courseClasses, selectedCourseClassId])

  /* ================= SORT & STATUS PARAM ================= */

  const statusParam =
    statusFilter.length === 1 ? statusFilter[0] === "PASSED" : undefined;

  const sortParam = useSortParam(sorting)

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
    const topicDisplay =
      classCourse?.course?.topicCode && classCourse?.course?.topicName
        ? `${classCourse.course.topicCode} - ${classCourse.course.topicName}`
        : classCourse?.course?.topicName || classCourse?.course?.topicCode || null

    const mappedItems =
      rows?.items?.map((r) => ({
        ...r,
        courseClassId: selectedCourseClassId,
        topic: topicDisplay,
      })) ?? []

    return {
      items: mappedItems as GradebookRow[],
      page: rows?.pagination?.page ?? pageIndex,
      pageSize: rows?.pagination?.pageSize ?? pageSize,
      totalPages: rows?.pagination?.totalPages ?? 0,
      columns: tableData?.data?.columns ?? [],
    }
  }, [tableData, classCourse, pageIndex, pageSize, selectedCourseClassId])

  /* ================= COLUMNS ================= */

  const columns = useMemo(
    () =>
      buildGradebookColumns(
        safeTableData.columns,
        isEditing
      ),
    [safeTableData.columns, isEditing]
  )

  /* ================= RENDER ================= */
  const courseOptions = courseClasses.map((cc) => ({
    value: cc.id,
    label: cc.course.courseCode,
    raw: cc,
  }))

  return (
    <div className="relative space-y-4 h-[calc(100%-90px)] flex-1">
      {isEditing && (
        <p className="text-xs text-muted-foreground font-semibold">
          <Badge variant={"destructive"} className='text-xs text-center mr-1'>Editing Mode</Badge> Enter: Save • Esc: Cancel
        </p>
      )}
      {/* Dropdown */}
      <SearchableSelect
        label="Topic Code"
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
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        headerActions={
          <div>
            <div className="flex items-end justify-between">
              <div className="flex gap-2">
                {activeRole?.name !== ROLES.SUPER_ADMIN &&
                 activeRole?.name !== ROLES.STUDENT && (
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="bg-blue-600 text-white"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryOpen(true)}
                >
                  <HistoryIcon className="mr-2 h-4 w-4" />
                  View History
                </Button>

                <EntityImportExportButton
                  mode={activeRole?.name === ROLES.SUPER_ADMIN ? "export" : "all"}
                  title={`Topic Marks [${classCourse?.course.courseCode || 'Unknown'}]`}
                  useImportHook={() => useImportTopicMarks({ id: selectedCourseClassId })}
                  useExportHook={() =>
                    useExportTopicMarks({ id: selectedCourseClassId })
                  }
                  useTemplateHook={() => useExportTemplate({ id: selectedCourseClassId })}
                />
              </div>
            </div>
          </div>
        }
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
      <GradeHistorySheet
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        courseClassId={selectedCourseClassId}
        courseCode={classCourse?.course.courseCode || 'Unknown'}
      />
    </div>
  )
}
