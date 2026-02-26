import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { DatabaseBackup, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { AxiosError } from "axios";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";

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

/* ===================== MAIN ===================== */
export default function DepartmentsTable() {
  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [openBackupModal, setOpenBackupModal] = useState(false);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  /* ---------- search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- sort param ---------- */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "name,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ---------- mutations ---------- */
  const { mutateAsync: importDepartments } = useImportDepartments();
  const { mutateAsync: exportDepartments } = useExportDepartments();
  const { mutateAsync: downloadTemplate } = useDownloadDepartmentTemplate();

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

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
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

  /* ---------- import / export ---------- */
  const handleImport = async (file: File) => {
    try {
      await importDepartments(file);
      toast.success("Import departments successfully");
      setOpenBackupModal(false);
      await invalidateDepartments();
      await reload();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to import departments",
      );
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportDepartments();
      downloadBlob(blob, "departments.xlsx");
      toast.success("Export departments successfully");
    } catch {
      toast.error("Failed to export departments");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      downloadBlob(blob, "department_import_template.xlsx");
      toast.success("Download template successfully");
    } catch {
      toast.error("Failed to download template");
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingDept,
        onEdit: (dept) => {
          setEditingDept(dept);
          setIsFormOpen(true);
        },
        onDelete: setDeletingDept,
      }),
    [],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<Department, unknown>
        columns={columns as ColumnDef<Department, unknown>[]}
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
        searchPlaceholder="name, code, location"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        headerActions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpenBackupModal(true)}
            >
              <DatabaseBackup className="h-4 w-4" />
              Import / Export
            </Button>
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
          </div>
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

      {/* ===== Import / Export modal ===== */}
      <ImportExportModal
        title="Departments"
        open={openBackupModal}
        setOpen={setOpenBackupModal}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
