import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { AxiosError } from "axios";

import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import type { Department } from "@/types/department";
import type { CreateDepartmentRequest } from "@/types/department";
import { departmentApi } from "@/api/departmentApi";

import { getColumns } from "./column";
import { DepartmentForm } from "./DepartmentForm";
import { DepartmentDetailDialog } from "./DetailDialog";
import { DEPARTMENT_QUERY_KEY, useGetAllDepartments } from "./services/queries";
import {
  useExportDepartments,
  useImportDepartments,
  useDownloadDepartmentTemplate,
} from "./services/mutations";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { FacetedFilter } from "@/components/FacedFilter";

/* ===================== MAIN ===================== */
export default function DepartmentsTable() {
  /* ---------- permissions ---------- */
  const { activePermissions } = useRoleSwitch();
  const permissions = activePermissions || [];
  const hasPermission = (p: string) => permissions.includes(p);
  const canCreate = hasPermission("DEPARTMENT_CREATE");
  const canUpdate = hasPermission("DEPARTMENT_UPDATE");
  const canDelete = hasPermission("DEPARTMENT_DELETE");
  const canImport = hasPermission("DEPARTMENT_IMPORT");
  const canExport = hasPermission("DEPARTMENT_EXPORT");

  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  /* ---------- search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- status filter ---------- */
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const statusParam = statusFilter.length === 1 ? statusFilter[0] : undefined;

  /* ---------- sort param ---------- */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "name,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ---------- query ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllDepartments({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
    status: statusParam,
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

  /* ---------- helpers ---------- */
  const invalidateDepartments = async () => {
    await queryClient.invalidateQueries({ queryKey: [DEPARTMENT_QUERY_KEY] });
  };

  /* ---------- CRUD ---------- */
  const handleCreate = async (formData: Partial<Department>) => {
    try {
      await departmentApi.create(formData as CreateDepartmentRequest);
      toast.success("Department created successfully");
      setIsFormOpen(false);
      await invalidateDepartments();
      await reload();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create department");
      }
    }
  };

  const handleUpdate = async (formData: Partial<Department>) => {
    if (!editingDept?.id) return;
    try {
      await departmentApi.update(editingDept.id, formData);
      toast.success("Department updated successfully");
      setIsFormOpen(false);
      setEditingDept(null);
      await invalidateDepartments();
      await reload();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update department");
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingDept?.id) return;
    try {
      await departmentApi.delete(deletingDept.id);
      toast.success("Department deleted successfully");
      await invalidateDepartments();
      await reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete department");
    } finally {
      setDeletingDept(null);
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingDept,
        onEdit: canUpdate
          ? (dept) => {
              setEditingDept(dept);
              setIsFormOpen(true);
            }
          : undefined,
        onDelete: canDelete ? setDeletingDept : undefined,
      }),
    [canUpdate, canDelete],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<Department, unknown>
        columns={columns as ColumnDef<Department, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        searchPlaceholder="name, code, location"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        facetedFilters={
          <div>
            <FacetedFilter
              title="Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
              value={statusFilter}
              setValue={setStatusFilter}
              multiple={false}
            />
          </div>
        }
        headerActions={
          (canCreate || canImport || canExport) && (
            <div className="flex gap-2">
              {(canImport || canExport) && (
                <EntityImportExportButton
                  title="Departments"
                  useImportHook={useImportDepartments}
                  useExportHook={useExportDepartments}
                  useTemplateHook={useDownloadDepartmentTemplate}
                />
              )}
              {canCreate && (
                <Button
                  onClick={() => {
                    setEditingDept(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </Button>
              )}
            </div>
          )
        }
      />

      {/* ===== Create / Update ===== */}
      <DepartmentForm
        open={isFormOpen}
        initial={editingDept}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDept(null);
        }}
        onSaved={editingDept ? handleUpdate : handleCreate}
      />

      {/* ===== View detail ===== */}
      <DepartmentDetailDialog
        open={!!viewingDept}
        department={viewingDept}
        onClose={() => setViewingDept(null)}
      />

      {/* ===== Delete confirm ===== */}
      <ConfirmDialog
        open={!!deletingDept}
        title="Delete Department"
        description={`Are you sure you want to delete "${deletingDept?.name}"?`}
        onCancel={() => setDeletingDept(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
