import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { DataTable } from "@/components/data_table/DataTable";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { TraineeDetailsResponse } from "@/types/trainerClass";
import { useGetClassTrainees } from "@/pages/training-classes/trainer/services/queries";

interface Props {
  classId: string;
}

const EMPTY_DATA: TraineeDetailsResponse[] = [];

const columnHelper = createColumnHelper<TraineeDetailsResponse>();
const columns = [
  columnHelper.display({
    id: "number",
    header: "#",
    size: 50,
    cell: ({ row, table }) =>
      row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize,
  }),
  columnHelper.accessor("firstName", {
    header: "Họ và tên",
    cell: (info) => (
      <span className="font-semibold">
        {info.row.original.firstName} {info.row.original.lastName}
      </span>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
  }),
];

export default function ClassTraineesTable({ classId }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetClassTrainees(classId, {
    page: pageIndex,
    size: pageSize,
    keyword: debouncedSearch,
  });

  const safeData = useMemo(() => tableData?.items || EMPTY_DATA, [tableData]);

  const handleSearchChange = useCallback((e: any) => {
    const text = typeof e === "string" ? e : e?.target?.value || "";
    setSearchValue(text);
    setPageIndex(0);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <DataTable<TraineeDetailsResponse, unknown>
        columns={columns as ColumnDef<TraineeDetailsResponse, unknown>[]}
        data={safeData}
        isLoading={isLoading}
        isFetching={isFetching}
        /* SERVER-SIDE MODE */
        manualPagination={true}
        manualSearch={true}
        pageIndex={tableData?.pagination?.page ?? pageIndex}
        pageSize={tableData?.pagination?.pageSize ?? pageSize}
        totalPage={tableData?.pagination?.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        /* SEARCH */
        isSearch={true}
        searchPlaceholder="tên hoặc email..."
        onSearchChange={handleSearchChange}
      />
    </div>
  );
}
