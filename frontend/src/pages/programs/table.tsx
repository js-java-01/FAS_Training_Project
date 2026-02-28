import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import type { TrainingProgram } from "@/types/trainingProgram";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import { useGetAllTrainingPrograms } from "./services/queries";
import { getColumns } from "./column";

export default function ProgramsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [deletingProgram, setDeletingProgram] = useState<TrainingProgram | null>(null);
  const [viewingProgram, setViewingProgram] = useState<TrainingProgram | null>(null);

  const queryClient = useQueryClient();
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
        onView: setViewingProgram,
        onDelete: setDeletingProgram,
      }),
    [],
  );

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-programs"] });
  };

  const handleDelete = async () => {
    if (!deletingProgram) return;

    try {
      await trainingProgramApi.deleteTrainingProgram(deletingProgram.id);
      toast.success("Deleted successfully");
      await invalidateAll();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingProgram(null);
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

      <ConfirmDialog
        open={!!deletingProgram}
        title="Delete Program"
        description={`Are you sure you want to delete "${deletingProgram?.name}"?`}
        onCancel={() => setDeletingProgram(null)}
        onConfirm={() => void handleDelete()}
      />

      <Dialog open={!!viewingProgram} onOpenChange={() => setViewingProgram(null)}>
        <DialogContent className="sm:max-w-140">
          <DialogHeader>
            <DialogTitle>Training Program Details</DialogTitle>
            <DialogDescription>{viewingProgram?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <p className="font-semibold">Name</p>
              <p className="text-muted-foreground">{viewingProgram?.name || "-"}</p>
            </div>
            <div>
              <p className="font-semibold">Version</p>
              <p className="text-muted-foreground">{viewingProgram?.version || "-"}</p>
            </div>
            <div>
              <p className="font-semibold">Description</p>
              <p className="text-muted-foreground">{viewingProgram?.description || "-"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
