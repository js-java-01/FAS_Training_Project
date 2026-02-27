import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import type { TrainingClass } from "@/types/trainingClass";
import { useGetAllTrainingClasses } from "./services/queries";
import { getColumns } from "./column";
import { TrainingClassForm } from "./form";
import { TrainingClassDetailDialog } from "./DetailDialog";
import { FacetedFilter } from "@/components/FacedFilter";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";

/* ======================================================= */
interface TrainingClassesTableProps {
  role: string;
}

export default function TrainingClassesTable({ role }: TrainingClassesTableProps) {
  /* ===================== STATE ===================== */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [openForm, setOpenForm] = useState(false);
  const [viewingClass, setViewingClass] = useState<TrainingClass | null>(null);

  /* ---------- faceted filter ---------- */
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  /* ---------- filter param (server side) ---------- */
  const statusParam = statusFilter.length === 1 ? statusFilter[0] === "ACTIVE" : undefined;

  const queryClient = useQueryClient();

  /* ===================== SORT ===================== */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "className,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ===================== DATA ===================== */
  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetAllTrainingClasses({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
    isActive: statusParam,
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

  /* ===================== COLUMNS ===================== */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingClass,
      }),
    [],
  );

  /* ===================== HANDLERS ===================== */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-classes"] });
  };

  const handleSaved = async () => {
    toast.success("Class request submitted successfully");
    await invalidateAll();
    setOpenForm(false);
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<TrainingClass, unknown>
        columns={columns as ColumnDef<TrainingClass, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        /* PAGINATION */
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        /* SEARCH */
        isSearch
        searchPlaceholder="class name or code"
        onSearchChange={setSearchValue}
        /* SORTING */
        sorting={sorting}
        onSortingChange={setSorting}
        /* ACTIONS */
        headerActions={
          role === "DEPARTMENT_MANAGER" && (
            <div className="flex gap-2">
              <Button onClick={() => setOpenForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                Open Class Request
              </Button>
            </div>
          )
        }
        facetedFilters={
          <div>
            <FacetedFilter
              title="Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Pending" },
              ]}
              value={statusFilter}
              setValue={setStatusFilter}
              multiple={false}
            />
          </div>
        }
      />

      <TrainingClassForm open={openForm} onClose={() => setOpenForm(false)} onSaved={handleSaved} />

      <TrainingClassDetailDialog
        open={!!viewingClass}
        trainingClass={viewingClass}
        onClose={() => setViewingClass(null)}
      />
    </div>
  );
}
