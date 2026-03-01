import { useMemo, useState, useEffect } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "./column";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { moduleApi, moduleGroupApi } from "@/api/moduleApi";
import type { Module, CreateModuleRequest } from "@/types/module";
import { ModuleForm } from "./ModuleForm";
import { useDebounce } from "@uidotdev/usehooks";
import { useGetAllModules } from "./services/queries/index";
import { ModuleDetailDialog } from "./DetailDialog";
import {
  useDownloadTemplate,
  useExportModules,
  useImportModules,
} from "@/pages/modules/module/services/mutations";
import { FacetedFilter } from "@/components/FacedFilter";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ROLES } from "@/types/role";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import { useSortParam } from "@/hooks/useSortParam";

/* ===================== MAIN ===================== */
export default function ModulesTable() {
  /* ---------- permission---------- */
  const { activePermissions, activeRole } = useRoleSwitch();
  const isSuperAdmin = activeRole?.name === ROLES.SUPER_ADMIN;
  const permissions = activePermissions || [];
  console.log("active", permissions)

  const hasPermission = (permission: string) =>
    permissions.includes(permission);

  const canCreate = hasPermission("MODULE_CREATE") && isSuperAdmin;
  const canUpdate = hasPermission("MODULE_UPDATE") && isSuperAdmin;
  const canDelete = hasPermission("MODULE_DELETE") && isSuperAdmin;
  const canImport = hasPermission("MODULE_IMPORT") && isSuperAdmin;
  const canExport = hasPermission("MODULE_EXPORT") && isSuperAdmin;


  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [viewingModule, setViewingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  /* ---------- search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- faced filter ---------- */
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [moduleGroupFilter, setModuleGroupFilter] = useState<string[]>([]);

  /* ---------- filter param (server side) ---------- */
  const statusParam =
    statusFilter.length === 1 ? statusFilter[0] === "ACTIVE" : undefined;

  const moduleGroupParam =
    moduleGroupFilter.length === 1 ? moduleGroupFilter[0] : undefined;

  /* ---------- sort param (server side) ---------- */
  /* ===================== SORT ===================== */
  const sortParam = useSortParam(sorting)

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
    isActive: statusParam,
    moduleGroupId: moduleGroupParam,
  });

  /* ---------- Reset table when filter changes ---------- */
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, statusFilter, moduleGroupFilter]);

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
       getColumns(
         {
           onView: setViewingModule,
           onEdit: canUpdate
             ? (m) => {
                 setEditingModule(m);
                 setIsFormOpen(true);
               }
             : undefined,
           onDelete: canDelete ? setDeletingModule : undefined,
         },
         {
           canUpdate,
           canDelete,
         }
       ),
     [canUpdate, canDelete]
   );

  const { data: moduleGroups } = useQuery({
    queryKey: ["module-groups-list"],
    queryFn: moduleGroupApi.getAllModuleGroupsList,
  });

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
                 (canCreate || canImport || canExport) && (
                   <div className="flex flex-row gap-2">
                     {(canImport || canExport) && (
                       <EntityImportExportButton
                         title="Modules"
                         useImportHook={useImportModules}
                         useExportHook={useExportModules}
                         useTemplateHook={useDownloadTemplate}
                       />
                     )}

                     {canCreate && (
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
                     )}
                   </div>
                 )
               }
        /*Faced filter */
        facetedFilters={
          <div className="flex gap-1">
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
            <FacetedFilter
              title="Module Group"
              options={
                moduleGroups?.map(g => ({
                  value: g.id,
                  label: g.name,
                })) ?? []
              }
              value={moduleGroupFilter}
              setValue={setModuleGroupFilter}
              multiple={false}
            />
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
    </div>
  );
}
