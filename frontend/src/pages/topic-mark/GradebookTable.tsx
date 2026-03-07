import { useMemo, useState, useEffect } from "react"
import type { SortingState } from "@tanstack/react-table"
import { useDebounce } from "@uidotdev/usehooks"
import { DataTable } from "@/components/data_table/DataTable"
import { FacetedFilter } from "@/components/FacedFilter"
import { buildGradebookColumns } from "./columns"
import {
  useGetTrainingInfo,
  useGetGradebookTable,
} from "./services/queries"
import type { GradebookRow, TopicInfo } from "@/types/topicMark"
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
  const [selectedTopicId, setSelectedTopicId] = useState("")

  /* ================= TRAINING INFO ================= */

  const { data: trainingInfo } = useGetTrainingInfo(classId)

  const topics: TopicInfo[] = trainingInfo?.trainingProgram?.topics ?? []

  useEffect(() => {
    if (!selectedTopicId && topics.length) {
      setSelectedTopicId(topics[0].id)
    }
  }, [topics, selectedTopicId])

  const topicId = selectedTopicId
  const selectedTopic = topics.find(t => t.id === selectedTopicId)

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
    topicId,
    trainingClassId: classId,
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
    passed: statusParam,
    enabled: !!topicId && !!classId,
  })

  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch, statusFilter, selectedTopicId])

  /* ================= SAFE DATA ================= */

  const safeTableData = useMemo(() => {
    const rows = tableData?.data?.rows
    const topicDisplay = selectedTopic
      ? `${selectedTopic.topicCode} - ${selectedTopic.topicName}`
      : null

    const mappedItems =
      rows?.items?.map((r) => ({
        ...r,
        topicId,
        trainingClassId: classId,
        topic: topicDisplay,
      })) ?? []

    return {
      items: mappedItems as GradebookRow[],
      page: rows?.pagination?.page ?? pageIndex,
      pageSize: rows?.pagination?.pageSize ?? pageSize,
      totalPages: rows?.pagination?.totalPages ?? 0,
      columns: tableData?.data?.columns ?? [],
    }
  }, [tableData, selectedTopic, pageIndex, pageSize, selectedTopicId])

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
  const topicOptions = topics.map((t) => ({
    value: t.id,
    label: t.topicCode,
    raw: t,
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
        value={selectedTopicId}
        onChange={(val) => setSelectedTopicId(val)}
        options={topicOptions}
        renderOption={(option) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {option.raw?.topicCode}
            </span>
            <span className="text-xs text-muted-foreground">
              {option.raw?.topicName}
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
                  title={`Topic Marks [${selectedTopic?.topicCode || 'Unknown'}]`}
                  useImportHook={() => useImportTopicMarks({ topicId, trainingClassId: classId })}
                  useExportHook={() =>
                    useExportTopicMarks({ topicId, trainingClassId: classId })
                  }
                  useTemplateHook={() => useExportTemplate({ topicId, trainingClassId: classId })}
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
        topicId={topicId}
        trainingClassId={classId}
        courseCode={selectedTopic?.topicCode || 'Unknown'}
      />
    </div>
  )
}
