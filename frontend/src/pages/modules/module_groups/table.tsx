import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { DatabaseBackup, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import type { ModuleGroup } from "@/types/module";
import { moduleGroupApi } from "@/api/moduleApi";
import { useGetAllModuleGroups } from "@/pages/modules/module_groups/services/queries";

import { getColumns } from "./column";
import { ModuleGroupForm } from "./form";
import type { ModuleGroupDto } from "./form";
import { ModuleGroupDetailDialog } from "./DetailDialog";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import {
  useDownloadTemplate,
  useExportModuleGroup,
  useImportModuleGroup,
} from "@/pages/modules/module_groups/services/mutations";

/* ======================================================= */

export default function ModuleGroupsTable() {
  /* ===================== STATE ===================== */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ModuleGroupDto | null>(null);
  const [deleting, setDeleting] = useState<ModuleGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<ModuleGroup | null>(null);
  const [openBackupModal, setOpenBackupModal] = useState(false);

  const { mutateAsync: importModuleGroup } = useImportModuleGroup();
  const { mutateAsync: exportModuleGroup } = useExportModuleGroup();
  const { mutateAsync: downloadTemplate } = useDownloadTemplate();

  const queryClient = useQueryClient();

  /* ===================== SORT ===================== */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "displayOrder,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ===================== DATA ===================== */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllModuleGroups({
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

  /* ===================== COLUMNS ===================== */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingGroup,
        onEdit: (group) => {
          setEditing({
            id: group.id,
            name: group.name,
            description: group.description ?? "",
            displayOrder: group.displayOrder,
            isActive: group.isActive,
          });
          setOpenForm(true);
        },
        onDelete: setDeleting,
      }),
    [],
  );

  /* ===================== HANDLERS ===================== */
  const invalidateModuleGroups = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["module-groups"],
    });
  };

  const handleSaved = async (saved: ModuleGroupDto) => {
    try {
      if (saved.id) {
        await moduleGroupApi.updateModuleGroup(saved.id, saved);
        toast.success("Updated successfully");
      } else {
        await moduleGroupApi.createModuleGroup(saved);
        toast.success("Created successfully");
      }

      await invalidateModuleGroups();
      await reload();

      setOpenForm(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await moduleGroupApi.deleteModuleGroup(deleting.id);
      toast.success("Deleted successfully");

      await invalidateModuleGroups();
      await reload();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  /* ================= IMPORT / EXPORT / TEMPLATE ================= */
  const handleImport = async (file: File) => {
    try {
      await importModuleGroup(file);
      toast.success("Import module groups successfully");
      setOpenBackupModal(false);
      await invalidateModuleGroups();
      await reload();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to import module groups",
      );
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportModuleGroup();
      downloadBlob(blob, "module_groups.xlsx");
      toast.success("Export module groups successfully");
    } catch {
      toast.error("Failed to export module groups");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      downloadBlob(blob, "module_groups_template.xlsx");
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
      <DataTable<ModuleGroup, unknown>
        columns={columns as ColumnDef<ModuleGroup, unknown>[]}
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
        searchPlaceholder="module group name"
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
                setEditing(null);
                setOpenForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Group
            </Button>
          </div>
        }
      />

      <ModuleGroupForm
        open={openForm}
        initial={editing}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        totalRecords={safeTableData.totalElements}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete Module Group"
        description={`Are you sure you want to delete "${deleting?.name}"?`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />

      <ModuleGroupDetailDialog
        open={!!viewingGroup}
        group={viewingGroup}
        onClose={() => setViewingGroup(null)}
      />

      <ImportExportModal
        title="Module Groups"
        open={openBackupModal}
        setOpen={setOpenBackupModal}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
