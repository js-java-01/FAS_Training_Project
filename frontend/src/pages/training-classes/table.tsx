import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import type { TrainingClass } from "@/types/trainingClass";
import { getColumns, type TablePermissions } from "./column";
import { TrainingClassForm } from "./form";
import { FacetedFilter } from "@/components/FacedFilter";
import { ClassStatus } from "./enum/ClassStatus";
import { useGetAllTrainingClasses } from "./services/queries";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ClientDataTable } from "@/components/data_table/ClientDataTable";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { encodeRouteId } from "@/utils/routeIdCodec";
import { useDebounce } from "@/hooks/useDebounce";

/* ======================================================= */
interface TrainingClassesTableProps {
  role: string;
  mode?: "all" | "semester";
  semesterId?: string | null;
  onSelectSemester?: (semesterId: string | null) => void;
  permissions: string[];
}

export default function TrainingClassesTable({
  role,
  mode = "semester",
  semesterId,
  onSelectSemester,
  permissions,
}: TrainingClassesTableProps) {
  /* ===================== STATE ===================== */

  const [openForm, setOpenForm] = useState(false);
  const navigate = useNavigate();

  /* ---------- faceted filter ---------- */
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const statusParam = statusFilter.length === 1 ? statusFilter[0] : undefined;
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  const sortParam = useMemo(() => {
    const currentSort = sorting[0];
    if (!currentSort) return "className,asc";
    return `${currentSort.id},${currentSort.desc ? "desc" : "asc"}`;
  }, [sorting]);

  const queryClient = useQueryClient();

  const semesterMode = mode === "semester";
  const canCreate = permissions.includes("CLASS_CREATE");

  /* ===================== DATA ===================== */
  const {
    data: allClassesData,
    isLoading,
    isFetching,
  } = useGetAllTrainingClasses({
    page: semesterMode ? 0 : pageIndex,
    pageSize: semesterMode ? 200 : pageSize,
    sort: sortParam,
    keyword: semesterMode ? undefined : debouncedKeyword,
    semesterId: semesterMode ? (semesterId ?? undefined) : undefined,
    classStatus: semesterMode ? statusParam : undefined,
    enabled: semesterMode ? !!semesterId : true,
  });

  const safeTableData = useMemo(() => allClassesData?.items || [], [allClassesData?.items]);
  const totalPages = allClassesData?.pagination?.totalPages ?? 0;

  /* ===================== COLUMNS ===================== */
  const tablePermissions: TablePermissions = {
    canUpdate: permissions.includes("CLASS_UPDATE"),
    canDelete: permissions.includes("CLASS_DELETE"),
  };

  const columns = useMemo(
    () =>
      getColumns(role, tablePermissions, {
        onNavigate: (trainingClass) => {
          navigate(`/classes/${encodeRouteId("classes", trainingClass.id)}`, {
            state: { trainingClass },
          });
        },
      }),
    [navigate, role, tablePermissions],
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
      {semesterMode && onSelectSemester && (
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSemester(null);
                }}
                className=" hover:text-blue-300 text-blue-800"
              >
                Danh sách Học kỳ
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage className="font-bold text-blue-800">
                Học kỳ {safeTableData[0]?.semesterName || "..."}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {semesterMode ? (
        <ClientDataTable<TrainingClass, unknown>
          columns={columns as ColumnDef<TrainingClass, unknown>[]}
          data={safeTableData}
          isLoading={isLoading}
          isFetching={isFetching}
          isSearch={true}
          searchValue={["className", "classCode"]}
          facetedFilters={
            role === "MANAGER" && (
              <div>
                <FacetedFilter
                  title="Trạng thái"
                  options={[
                    { value: ClassStatus.APPROVED, label: "Approved" },
                    { value: ClassStatus.PENDING_APPROVAL, label: "Pending Approval" },
                    { value: ClassStatus.REJECTED, label: "Rejected" },
                  ]}
                  value={statusFilter}
                  setValue={setStatusFilter}
                  multiple={false}
                />
              </div>
            )
          }
        />
      ) : (
        <ServerDataTable<TrainingClass, unknown>
          columns={columns as ColumnDef<TrainingClass, unknown>[]}
          data={safeTableData}
          isLoading={isLoading}
          isFetching={isFetching}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPage={totalPages}
          onPageChange={setPageIndex}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPageIndex(0);
          }}
          isSearch={true}
          onSearchChange={setSearchKeyword}
          sorting={sorting}
          onSortingChange={(nextSorting) => {
            setSorting(nextSorting);
            setPageIndex(0);
          }}
          headerActions={
            canCreate &&
            (role === "ADMIN" || role === "MANAGER") && (
              <div className="flex gap-2">
                <Button onClick={() => setOpenForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <Plus className="h-4 w-4" />
                  Open Class Request
                </Button>
              </div>
            )
          }
        />
      )}

      <TrainingClassForm role={role} open={openForm} onClose={() => setOpenForm(false)} onSaved={handleSaved} />
    </div>
  );
}
