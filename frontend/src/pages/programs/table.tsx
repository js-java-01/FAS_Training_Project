import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import type { TrainingProgram } from "@/types/trainingProgram";
import { useGetAllTrainingPrograms } from "./services/queries";
import { getColumns } from "./column";

export default function ProgramsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const navigate = useNavigate();

  const sortParam = useMemo(() => {
    if (!sorting.length) return ["createdAt", "desc"];
    const { id, desc } = sorting[0];
    return [id, desc ? "desc" : "asc"];
  }, [sorting]);

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetAllTrainingPrograms({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
  });

  const safeTableData = useMemo(
    () => ({
      items: tableData?.items ?? [],
      page: tableData?.pagination?.page ?? pageIndex,
      pageSize: tableData?.pagination?.pageSize ?? pageSize,
      totalPages: tableData?.pagination?.totalPages ?? 0,
      totalElements: tableData?.pagination?.totalElements ?? 0,
    }),
    [tableData, pageIndex, pageSize],
  );

  const columns = useMemo(
    () =>
      getColumns({
        onView: (program) => navigate(`/programs/${program.id}`),
      }),
    [navigate],
  );

  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<TrainingProgram, unknown>
        columns={columns as ColumnDef<TrainingProgram, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        searchPlaceholder="program name"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        headerActions={
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/programs/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Create New Program
            </Button>
          </div>
        }
      />
    </div>
  );
}
