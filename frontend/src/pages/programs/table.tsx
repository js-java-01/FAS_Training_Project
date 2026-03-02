import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import type { TrainingProgram } from "@/types/trainingProgram";
import { useSortParam } from "@/hooks/useSortParam";
import { encodeRouteId } from "@/utils/routeIdCodec";
import { useGetAllTrainingPrograms } from "./services/queries";
import { getColumns } from "./column";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import {
  useExportTrainingPrograms,
  useImportTrainingPrograms,
  useDownloadTrainingProgramTemplate,
} from "./services/mutations";

export default function ProgramsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const navigate = useNavigate();

  const sortParam = useSortParam(sorting, "createdAt,desc");

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
        onView: (program) => navigate(`/programs/${encodeRouteId("programs", program.id)}`),
        onDelete: (program) => {
          setSelectedProgram(program);
          setIsDeleteModalOpen(true);
        },
      }),
    [navigate],
  );

  const handleDelete = async () => {
    if (!selectedProgram) return;
    try {
      await trainingProgramApi.deleteTrainingProgram(selectedProgram.id);
      toast.success("Training program deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["training-programs"] });
      setIsDeleteModalOpen(false);
      setSelectedProgram(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete training program");
    }
  };

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
            <EntityImportExportButton
              title="Training Programs"
              useImportHook={useImportTrainingPrograms}
              useExportHook={useExportTrainingPrograms}
              useTemplateHook={useDownloadTrainingProgramTemplate}
            />
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
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedProgram(null);
        }}
        onConfirm={handleDelete}
        title="Delete Training Program"
        message={
          <>
            This action cannot be undone. This will permanently delete the training
            program{" "}
            <span className="font-semibold">
              &quot;{selectedProgram?.name}&quot;
            </span>
            .
          </>
        }
      />
    </div>
  );
}
