import { useMemo, useState, useCallback, useEffect } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import { getColumns } from "./column";
import { DepartmentForm } from "./DepartmentForm";
import { DepartmentDetailDialog } from "./DetailDialog";
import { ImportModal } from "@/components/ImportModal";
import ConfirmDialog from "@/components/ui/confirmdialog";

import type { Department } from "@/types/department";
import { departmentApi } from "@/api/departmentApi";
import { PermissionGate } from "@/components/PermissionGate";

/* ===================== TABLE STATE ===================== */
export default function DepartmentsTable() {
  /* ---- Modal & View ---- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  /* ---- Table State ---- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /* ---- Search ---- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---- Sort Param (Server Side) ---- */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "name,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ---- Load Data ---- */
  const loadDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      const result: any = await departmentApi.search(pageIndex, pageSize, debouncedSearch, sortParam);
      const safeContent: any[] = result?.content ?? result?.items ?? (Array.isArray(result) ? result : []);
      const safeTotal = result?.totalPages ?? result?.pagination?.totalPages ?? Math.max(1, Math.ceil((safeContent?.length || 0) / pageSize));

      setDepartments(safeContent || []);
      setTotalPages(safeTotal || 0);
    } catch (err) {
      console.error("Error loading departments:", err);
      toast.error("Failed to load departments");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, debouncedSearch, sortParam]);

  // Load when dependencies change
  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  /* ---- CRUD Operations ---- */
  const handleCreate = useCallback(
    async (formData: Partial<Department>) => {
      try {
        await departmentApi.create(formData);
        toast.success("Department created successfully");
        setIsFormOpen(false);
        setPageIndex(0); // Reset to first page
        await loadDepartments();
      } catch (err: any) {
        console.error("Error creating department:", err);
        toast.error(
          err.response?.data?.message || "Failed to create department"
        );
      }
    },
    [loadDepartments]
  );

  const handleUpdate = useCallback(
    async (formData: Partial<Department>) => {
      if (!editingDept?.id) return;
      try {
        await departmentApi.update(editingDept.id, formData);
        toast.success("Department updated successfully");
        setIsFormOpen(false);
        setEditingDept(null);
        await loadDepartments();
      } catch (err: any) {
        console.error("Error updating department:", err);
        toast.error(
          err.response?.data?.message || "Failed to update department"
        );
      }
    },
    [editingDept, loadDepartments]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingDept?.id) return;
    try {
      await departmentApi.delete(deletingDept.id);
      toast.success("Department deleted successfully");
      setDeletingDept(null);
      // Reset to first page if not on first page
      if (pageIndex > 0) {
        setPageIndex(0);
      } else {
        await loadDepartments();
      }
    } catch (err: any) {
      console.error("Error deleting department:", err);
      toast.error(err.response?.data?.message || "Failed to delete department");
    }
  }, [deletingDept, pageIndex, loadDepartments]);

  const handleImport = useCallback(
    async (file: File) => {
      try {
        await departmentApi.import(file);
        toast.success("Import successful");
        setShowImportModal(false);
        setPageIndex(0);
        await loadDepartments();
      } catch (err: any) {
        console.error("Error importing:", err);
        toast.error(err.response?.data?.message || "Import failed");
      }
    },
    [loadDepartments]
  );

  const handleExport = useCallback(async () => {
    try {
      const response = await departmentApi.export();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "departments.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful");
    } catch (err) {
      console.error("Error exporting:", err);
      toast.error("Export failed");
    }
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const blob = await departmentApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "department_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading template:", err);
      toast.error("Failed to download template");
    }
  }, []);

  /* ---- Columns ---- */
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
    []
  );

  /* ===================== RENDER ===================== */
  return (
    <>
      <div className="space-y-4 h-full flex-1">
        {/* ---- Header Actions ---- */}
        <div className="flex gap-2 justify-end flex-wrap">
          <PermissionGate permission="DEPARTMENT_IMPORT">
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </PermissionGate>

          <PermissionGate permission="DEPARTMENT_EXPORT">
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </PermissionGate>

          <PermissionGate permission="DEPARTMENT_CREATE">
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
          </PermissionGate>
        </div>

        {/* ---- Table ---- */}
        <DataTable<Department, unknown>
          columns={columns as ColumnDef<Department, unknown>[]}
          data={departments}
          /* Loading states */
          isLoading={isLoading}
          /* Pagination (manual) */
          manualPagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPage={totalPages}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          /* Search */
          isSearch
          manualSearch
          searchPlaceholder="name, code, location"
          onSearchChange={setSearchValue}
          /* Sorting */
          sorting={sorting}
          onSortingChange={setSorting}
          manualSorting
        />
      </div>

      {/* ---- Modals & Dialogs ---- */}
      <DepartmentForm
        open={isFormOpen}
        initial={editingDept}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDept(null);
        }}
        onSaved={editingDept ? handleUpdate : handleCreate}
      />

      <DepartmentDetailDialog
        open={!!viewingDept}
        department={viewingDept}
        onClose={() => setViewingDept(null)}
      />

      <ConfirmDialog
        open={!!deletingDept}
        title="Delete Department"
        description={`Are you sure you want to delete "${deletingDept?.name}"?`}
        onCancel={() => setDeletingDept(null)}
        onConfirm={handleDelete}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Departments"
        onDownloadTemplate={handleDownloadTemplate}
        onImport={handleImport}
      />
    </>
  );
}
