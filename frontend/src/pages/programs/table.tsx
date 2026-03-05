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
import EntityImportExportButton from "@/components/modal/import-export/EntityImportExportBtn";
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
  const [inUseCount, setInUseCount] = useState(0);

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
      items: (tableData?.items ?? []).filter(Boolean),
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
        onDelete: async (program) => {
          setSelectedProgram(program);
          // Check if program is in use
          const inUseData = await trainingProgramApi.checkIfInUse(program.id);
          setInUseCount(inUseData.count);
          setIsDeleteModalOpen(true);
        },
      }),
    [navigate],
  );

  const handleDelete = async () => {
    if (!selectedProgram) return;
    try {
      // First, check if the program is in use
      const inUseData = await trainingProgramApi.checkIfInUse(selectedProgram.id);

      if (inUseData.inUse) {
        toast.error(
          `Cannot delete this training program because it is being used by ${inUseData.count} class(es). Please remove or reassign those classes first.`
        );
        setIsDeleteModalOpen(false);
        setSelectedProgram(null);
        return;
      }

      // If not in use, proceed with deletion
      await trainingProgramApi.deleteTrainingProgram(selectedProgram.id);
      toast.success("Training program deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["training-programs"] });
      setIsDeleteModalOpen(false);
      setSelectedProgram(null);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "";

      // Check if it's a foreign key constraint error
      if (errorMessage.toLowerCase().includes("foreign key") ||
          errorMessage.toLowerCase().includes("constraint") ||
          error?.response?.status === 400) {
        toast.error(
          "Cannot delete this training program because it is being used by one or more classes. Please remove or reassign those classes first."
        );
      } else {
        toast.error(errorMessage || "Failed to delete training program");
      }
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
          setInUseCount(0);
        }}
        onConfirm={handleDelete}
        title="Delete Training Program"
        message={
          inUseCount > 0 ? (
            <>
              <div className="text-sm text-red-600 font-semibold mb-3">
                ⚠️ Warning: This training program is in use!
              </div>
              <div className="text-sm mb-3">
                This training program is currently being used by <span className="font-semibold">{inUseCount} class(es)</span>. Deleting it will cause issues.
              </div>
              <div className="text-sm text-gray-700">
                Please reassign or delete those classes first before proceeding.
              </div>
            </>
          ) : (
            <>
              This action cannot be undone. This will permanently delete the training
              program{" "}
              <span className="font-semibold">
                &quot;{selectedProgram?.name}&quot;
              </span>
              .
            </>
          )
        }
        disabled={inUseCount > 0}
      />
    </div>
  );
}
