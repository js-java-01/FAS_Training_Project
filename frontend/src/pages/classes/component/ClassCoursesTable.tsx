import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { DataTable } from "@/components/data_table/DataTable";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { CourseDetailsResponse } from "@/types/course";
import { useGetClassCourses } from "@/pages/training-classes/trainer/services/queries";

interface Props {
  classId: string;
}

const EMPTY_DATA: CourseDetailsResponse[] = [];

const columnHelper = createColumnHelper<CourseDetailsResponse>();
const columns = [
  columnHelper.display({
    id: "number",
    header: "#",
    size: 50,
    cell: ({ row, table }) =>
      row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
  }),

  columnHelper.accessor("courseName", {
    header: "Tên môn học",
    size: 250,
    cell: (info) => <span className="font-semibold text-blue-700">{info.getValue()}</span>,
  }),

  columnHelper.accessor("courseCode", {
    header: "Mã môn",
    size: 120,
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
  }),

  columnHelper.accessor("level", {
    header: "Level",
    size: 120,
    cell: (info) => {
      const level = info.getValue();
      let colorClass = "bg-gray-100 text-gray-700";

      if (level === "BEGINNER") colorClass = "bg-green-100 text-green-700 border-green-200";
      else if (level === "INTERMEDIATE") colorClass = "bg-yellow-100 text-yellow-700 border-yellow-200";
      else if (level === "ADVANCED") colorClass = "bg-red-100 text-red-700 border-red-200";

      return <Badge className={`${colorClass} shadow-none`}>{level}</Badge>;
    },
  }),

  columnHelper.accessor("minGpaToPass", {
    header: "Min GPA",
    size: 100,
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),

  columnHelper.accessor("minAttendancePercent", {
    header: "Min Điểm danh",
    size: 140,
    cell: (info) => <span>{info.getValue()}%</span>,
  }),

  columnHelper.accessor("allowFinalRetake", {
    header: "Thi lại",
    size: 100,
    cell: (info) => (
      <div className="flex justify-center items-center">
        {info.getValue() ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-500" />}
      </div>
    ),
  }),
];

export default function ClassCoursesTable({ classId }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetClassCourses(classId, {
    page: pageIndex,
    size: pageSize,
    keyword: debouncedSearch,
  });

  const safeData = useMemo(() => tableData?.items || EMPTY_DATA, [tableData]);

  /* ===================== HANDLERS ===================== */
  const handleSearchChange = useCallback((e: any) => {
    const text = typeof e === "string" ? e : e?.target?.value || "";
    setSearchValue(text);
    setPageIndex(0);
  }, []);

  /* ===================== RENDER ===================== */
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <DataTable<CourseDetailsResponse, unknown>
        columns={columns as ColumnDef<CourseDetailsResponse, unknown>[]}
        data={safeData}
        isLoading={isLoading}
        isFetching={isFetching}
        manualPagination={true}
        manualSearch={true}
        pageIndex={tableData?.pagination?.page ?? pageIndex}
        pageSize={tableData?.pagination?.pageSize ?? pageSize}
        totalPage={tableData?.pagination?.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch={true}
        searchPlaceholder="tên môn, mã môn..."
        onSearchChange={handleSearchChange}
      />
    </div>
  );
}
