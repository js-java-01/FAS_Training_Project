import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import type { ModuleGroup } from "@/types/module";
import { moduleGroupApi } from "@/api/moduleApi";
import { useGetAllModuleGroups } from "@/pages/modules/module_groups/services/queries";
import { getColumns } from "./column";
import { ModuleGroupForm } from "./form";
import type { ModuleGroupDto } from "./form";
import { ModuleGroupDetailDialog } from "./DetailDialog";
import {
  useDownloadTemplate,
  useExportModuleGroup,
  useImportModuleGroup,
} from "@/pages/modules/module_groups/services/mutations";
import { FacetedFilter } from "@/components/FacedFilter";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";

/* ======================================================= */

export default function ModuleGroupsTable() {
  /* ---------- permission---------- */
  const { activePermissions } = useRoleSwitch();
  const permissions = activePermissions || [];
  console.log("active", permissions)

  const hasPermission = (permission: string) =>
    permissions.includes(permission);

  const canCreate = hasPermission("MODULE_GROUP_CREATE");
  const canUpdate = hasPermission("MODULE_GROUP_UPDATE");
  const canDelete = hasPermission("MODULE_GROUP_DELETE");
  const canImport = hasPermission("MODULE_GROUP_IMPORT");
  const canExport = hasPermission("MODULE_GROUP_EXPORT");

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

  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const statusParam =
    statusFilter.length === 1 ? statusFilter[0] === "ACTIVE" : undefined;

  const queryClient = useQueryClient();

  const sortParam = useMemo(() => {
    if (!sorting.length) return "displayOrder,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetAllModuleGroups({
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
    [tableData, pageIndex, pageSize]
  );

  /* ===================== COLUMNS ===================== */
  const columns = useMemo(
    () =>
      getColumns(
        {
          onView: setViewingGroup,
          onEdit: canUpdate
            ? (group) => {
                setEditing({
                  id: group.id,
                  name: group.name,
                  description: group.description ?? "",
                  displayOrder: group.displayOrder,
                  isActive: group.isActive,
                });
                setOpenForm(true);
              }
            : undefined,
          onDelete: canDelete ? setDeleting : undefined,
        },
        {
          canUpdate,
          canDelete,
        }
      ),
    [canUpdate, canDelete]
  );

  /* ===================== HANDLERS ===================== */
  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["module-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["module-groups", "active"] }),
    ]);
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

      await invalidateAll();
      setOpenForm(false);
      setEditing(null);
    } catch {
      toast.error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await moduleGroupApi.deleteModuleGroup(deleting.id);
      toast.success("Deleted successfully");
      await invalidateAll();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<ModuleGroup, unknown>
        columns={columns as ColumnDef<ModuleGroup, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        searchPlaceholder="module group name"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        headerActions={
          (canCreate || canImport || canExport) && (
            <div className="flex gap-2">
              {(canImport || canExport) && (
                <EntityImportExportButton
                  title="Module Groups"
                  useImportHook={useImportModuleGroup}
                  useExportHook={useExportModuleGroup}
                  useTemplateHook={useDownloadTemplate}
                />
              )}

              {canCreate && (
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
              )}
            </div>
          )
        }
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
    </div>
  );
}
