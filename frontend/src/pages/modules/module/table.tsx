import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { DatabaseBackup, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "./column";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import { moduleApi } from "@/api/moduleApi";
import type { Module, CreateModuleRequest } from "@/types/module";
import { ModuleForm } from "./ModuleForm";
import { useDebounce } from "@uidotdev/usehooks";
import { useGetAllModules } from "./services/queries";
import { ModuleDetailDialog } from "./DetailDialog";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import {
  useDownloadTemplate,
  useExportModules,
  useImportModules,
} from "@/pages/modules/module/services/mutations";

/* ===================== MAIN ===================== */
export default function ModulesTable() {
  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [openBackupModal, setOpenBackupModal] = useState(false);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  /* ---------- search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- sort param (server side) ---------- */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "displayOrder,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  const { mutateAsync: importModules } = useImportModules();
  const { mutateAsync: exportModules } = useExportModules();
  const { mutateAsync: downloadTemplate } = useDownloadTemplate();

  /* ---------- query ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetAllModules({
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

  /* ---------- CRUD ---------- */
  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["modules"] }), // update table
      queryClient.invalidateQueries({ queryKey: ["module-groups", "active"] }), // update sidebar
    ]);
  };

  const handleCreate = async (formData: Partial<Module>) => {
    try {
      await moduleApi.createModule(formData as CreateModuleRequest);
      toast.success("Created successfully");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create module");
      }
    }
  };

  const handleUpdate = async (formData: Partial<Module>) => {
    if (!editingModule?.id) return;
    try {
      await moduleApi.updateModule(editingModule.id, formData);
      toast.success("Updated successfully");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update module");
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingModule) return;
    try {
      await moduleApi.deleteModule(deletingModule.id);
      toast.success("Deleted successfully");
      await invalidateAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete module");
    } finally {
      setDeletingModule(null);
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingModule,
        onEdit: (m) => {
          setEditingModule(m);
          setIsFormOpen(true);
        },
        onDelete: setDeletingModule,
      }),
    [],
  );

  /* ================= IMPORT / EXPORT / TEMPLATE ================= */
  const handleImport = async (file: File) => {
    try {
      await importModules(file);
      toast.success("Import modules successfully");
      setOpenBackupModal(false);
      await invalidateAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to import modules");
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportModules();
      downloadBlob(blob, "modules.xlsx");
      toast.success("Export modules successfully");
    } catch {
      toast.error("Failed to export modules");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      downloadBlob(blob, "modules_template.xlsx");
      toast.success("Download template successfully");
    } catch {
      toast.error("Failed to download template");
    }
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

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<Module, unknown>
        columns={columns as ColumnDef<Module, unknown>[]}
        data={safeTableData.items}
        /* Loading states */
        isLoading={isLoading}
        isFetching={isFetching}
        /* Pagination (manual) */
        manualPagination
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        /* Search */
        isSearch
        manualSearch
        searchPlaceholder="module name"
        onSearchChange={setSearchValue}
        /* Sorting */
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        /* Header */
        headerActions={
          <div className={"flex flex-row gap-2"}>
            <Button
              variant="secondary"
              onClick={() => setOpenBackupModal(true)}
            >
              <DatabaseBackup className="h-4 w-4" />
              Import / Export
            </Button>
            <Button
              onClick={() => {
                setEditingModule(null);
                setIsFormOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Module
            </Button>
          </div>
        }
      />

      {/* ===== Create / Update ===== */}
      <ModuleForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingModule ? handleUpdate : handleCreate}
        initialData={editingModule}
      />

      {/* ===== View detail ===== */}
      <ModuleDetailDialog
        open={!!viewingModule}
        module={viewingModule}
        onClose={() => setViewingModule(null)}
      />

      <ConfirmDialog
        open={!!deletingModule}
        title="Delete Module"
        description={`Are you sure you want to delete "${deletingModule?.title}"?`}
        onCancel={() => setDeletingModule(null)}
        onConfirm={() => void handleDelete()}
      />

      <ImportExportModal
        title="Modules"
        open={openBackupModal}
        setOpen={setOpenBackupModal}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
