import { useMemo, useState, useEffect } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "./columns";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { permissionApi } from "@/api/permissionApi";
import type { Permission, CreatePermissionRequest } from "@/types/permission";
import { PermissionFormModal } from "./PermissionFormModal";
import { PermissionDetailDialog } from "./PermissionDetailDialog";
import { useDebounce } from "@uidotdev/usehooks";
import { useGetAllPermissions } from "./services/queries";
import {
  useExportPermissions,
  useImportPermissions,
  useDownloadPermissionTemplate,
} from "./services/mutations";
import { FacetedFilter } from "@/components/FacedFilter";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ROLES } from "@/types/role";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";

export default function PermissionsTable() {
  /* ---------- permissions ---------- */
  const { activePermissions, activeRole } = useRoleSwitch();
  const isSuperAdmin = activeRole?.name === ROLES.SUPER_ADMIN;
  const perms = activePermissions || [];

  const hasPermission = (p: string) => perms.includes(p);

  const canCreate = hasPermission("PERMISSION_CREATE") && isSuperAdmin;
  const canUpdate = hasPermission("PERMISSION_UPDATE") && isSuperAdmin;
  const canDelete = hasPermission("PERMISSION_DELETE") && isSuperAdmin;
  const canImport = hasPermission("PERMISSION_IMPORT") && isSuperAdmin;
  const canExport = hasPermission("PERMISSION_EXPORT") && isSuperAdmin;

  /* ---------- modal state ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );
  const [viewingPermission, setViewingPermission] = useState<Permission | null>(
    null,
  );
  const [deletingPermission, setDeletingPermission] =
    useState<Permission | null>(null);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  /* ---------- search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- faceted filters ---------- */
  const [resourceFilter, setResourceFilter] = useState<string[]>([]);
  const [actionFilter, setActionFilter] = useState<string[]>([]);

  /* ---------- sort param ---------- */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "name,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ---------- query ---------- */
  const {
    data: rawData,
    isLoading,
    isFetching,
  } = useGetAllPermissions({
    sort: sortParam,
  });

  /* ---------- reset on search change ---------- */
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch]);

  /* ---------- client-side filter by search + resource + action ---------- */
  const filteredItems = useMemo(() => {
    let items = rawData?.content ?? [];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.resource.toLowerCase().includes(q) ||
          p.action.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q),
      );
    }
    if (resourceFilter.length > 0) {
      items = items.filter((p) => resourceFilter.includes(p.resource));
    }
    if (actionFilter.length > 0) {
      items = items.filter((p) => actionFilter.includes(p.action));
    }
    return items;
  }, [rawData, debouncedSearch, resourceFilter, actionFilter]);

  /* ---------- unique resource/action options for faceted filters ---------- */
  const resourceOptions = useMemo(() => {
    const all = rawData?.content ?? [];
    return [...new Set(all.map((p) => p.resource))].sort().map((r) => ({
      value: r,
      label: r,
    }));
  }, [rawData]);

  const actionOptions = useMemo(() => {
    const all = rawData?.content ?? [];
    return [...new Set(all.map((p) => p.action))].sort().map((a) => ({
      value: a,
      label: a,
    }));
  }, [rawData]);

  const safeTableData = useMemo(
    () => ({
      items: filteredItems,
      totalPages: Math.ceil(filteredItems.length / pageSize) || 1,
    }),
    [filteredItems, pageSize],
  );

  /* ---------- CRUD ---------- */
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["permissions"] });

  const handleCreate = async (
    formData: Partial<Permission> | CreatePermissionRequest,
  ) => {
    try {
      await permissionApi.createPermission(formData as CreatePermissionRequest);
      toast.success("Permission created successfully");
      setIsFormOpen(false);
      invalidate();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create permission");
      }
    }
  };

  const handleUpdate = async (
    formData: Partial<Permission> | CreatePermissionRequest,
  ) => {
    if (!editingPermission?.id) return;
    try {
      await permissionApi.updatePermission(editingPermission.id, formData);
      toast.success("Permission updated successfully");
      setIsFormOpen(false);
      invalidate();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update permission");
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingPermission) return;
    try {
      await permissionApi.deletePermission(deletingPermission.id);
      toast.success("Permission deleted successfully");
      invalidate();
    } catch (error) {
      toast.error("Failed to delete permission");
    } finally {
      setDeletingPermission(null);
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns(
        {
          onView: setViewingPermission,
          onEdit: canUpdate
            ? (p) => {
                setEditingPermission(p);
                setIsFormOpen(true);
              }
            : undefined,
          onDelete: canDelete ? setDeletingPermission : undefined,
        },
        { canUpdate, canDelete },
      ),
    [canUpdate, canDelete],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<Permission, unknown>
        columns={columns as ColumnDef<Permission, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        /* Pagination — client-side on filtered data */
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        /* Search */
        isSearch
        searchPlaceholder="name, resource, action..."
        onSearchChange={setSearchValue}
        /* Sorting */
        sorting={sorting}
        onSortingChange={setSorting}
        /* Header actions */
        headerActions={
          (canCreate || canImport || canExport) && (
            <div className="flex flex-row gap-2">
              {(canImport || canExport) && (
                <EntityImportExportButton
                  title="Permissions"
                  useImportHook={useImportPermissions}
                  useExportHook={useExportPermissions}
                  useTemplateHook={useDownloadPermissionTemplate}
                />
              )}
              {canCreate && (
                <Button
                  onClick={() => {
                    setEditingPermission(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Permission
                </Button>
              )}
            </div>
          )
        }
        /* Faceted filters */
        facetedFilters={
          <div className="flex gap-1">
            <FacetedFilter
              title="Resource"
              options={resourceOptions}
              value={resourceFilter}
              setValue={setResourceFilter}
              multiple={false}
            />
            <FacetedFilter
              title="Action"
              options={actionOptions}
              value={actionFilter}
              setValue={setActionFilter}
              multiple={false}
            />
          </div>
        }
      />

      {/* ===== Create / Edit ===== */}
      <PermissionFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={editingPermission ? handleUpdate : handleCreate}
        initialData={editingPermission}
      />

      {/* ===== View detail ===== */}
      <PermissionDetailDialog
        open={!!viewingPermission}
        permission={viewingPermission}
        onClose={() => setViewingPermission(null)}
      />

      {/* ===== Confirm delete ===== */}
      <ConfirmDialog
        open={!!deletingPermission}
        title="Delete Permission"
        description={`Are you sure you want to delete "${deletingPermission?.name}"? This may affect roles using this permission.`}
        onCancel={() => setDeletingPermission(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
