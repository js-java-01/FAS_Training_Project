import React, { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { AxiosError } from "axios";
import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { FacetedFilter } from "@/components/FacedFilter";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { roleApi } from "@/api/features/rbac/role.api";
import { permissionApi } from "@/api/features/rbac/permission.api";
import type { RoleDTO, CreateRoleRequest } from "@/types/features/auth/role";
import { ROLES } from "@/types/features/auth/role";
import type { PermissionDTO } from "@/types/features/auth/permission";

import { getColumns } from "./columns";
import { RoleFormModal } from "./components/RoleFormModal";
import { RoleDetailDialog } from "./components/RoleDetailDialog";
import { ROLE_QUERY_KEY, useGetAllRoles } from "./services/queries";
import EntityImportExportButton from "@/components/modal/import-export/EntityImportExportBtn";
import {
  useDownloadRoleTemplate,
  useExportRoles,
  useImportRoles,
} from "./services/mutations";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { useSortParam } from "@/hooks/useSortParam";

/* ===================== MAIN ===================== */
export default function RoleTable() {
  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
  const [viewingRole, setViewingRole] = useState<RoleDTO | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleDTO | null>(null);
  const [permissions, setPermissions] = useState<PermissionDTO[]>([]);

  const [roleForm, setRoleForm] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    isActive: true,
    permissionIds: [],
  });

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const queryClient = useQueryClient();

  const { refreshRoles, activePermissions, activeRole } = useRoleSwitch();
  const activePerms = activePermissions || [];
  const hasPermission = (p: string) => activePerms.includes(p);
  const isSuperAdmin = activeRole?.name === ROLES.SUPER_ADMIN;
  const canCreate = hasPermission("ROLE_CREATE") && isSuperAdmin;
  const canUpdate = hasPermission("ROLE_UPDATE") && isSuperAdmin;
  const canImport = isSuperAdmin;
  const canExport = isSuperAdmin;

  /* ---------- search + filter ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const isActiveParam =
    statusFilter.length === 1 ? statusFilter[0] === "ACTIVE" : undefined;

  /* ---------- sort param ---------- */
  const sortParam = useSortParam(sorting, "name,asc");

  /* ---------- query ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllRoles({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
    isActive: isActiveParam,
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
  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({ queryKey: [ROLE_QUERY_KEY] });
  };

  /* ---------- open create ---------- */
  const openCreate = async () => {
    setIsEditMode(false);
    setEditingRole(null);
    setRoleForm({
      name: "",
      description: "",
      isActive: true,
      permissionIds: [],
    });
    const perms = await permissionApi.getAllPermissionsList();
    setPermissions(perms);
    setIsFormOpen(true);
  };

  /* ---------- open edit ---------- */
  const openEdit = async (role: RoleDTO) => {
    setIsEditMode(true);
    setEditingRole(role);
    setRoleForm({
      name: role.name ?? "",
      description: role.description ?? "",
      isActive: role.isActive ?? true,
      permissionIds: (role.permissionIds ?? []) as string[],
    });
    const perms = await permissionApi.getAllPermissionsList();
    setPermissions(perms);
    setIsFormOpen(true);
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingRole) {
        await roleApi.updateRole(editingRole.id!, roleForm);
        toast.success("Role updated successfully");
      } else {
        await roleApi.createRole(roleForm);
        toast.success("Role created successfully");
      }
      setIsFormOpen(false);
      await invalidateRoles();
      await reload();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to save role");
      }
    }
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      await roleApi.deleteRole(deletingRole.id!);
      toast.success("Role deleted successfully");
      await invalidateRoles();
      await reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete role");
    } finally {
      setDeletingRole(null);
    }
  };

  /* ---------- toggle status ---------- */
  const handleToggleStatus = async (id: string) => {
    try {
      await roleApi.toggleRoleStatus(id);
      toast.success("Role status updated");
      await invalidateRoles();
      await reload();
      // Refresh the header role switcher immediately
      refreshRoles();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingRole,
        onEdit: canUpdate ? openEdit : undefined,
        onToggleStatus: canUpdate ? handleToggleStatus : undefined,
        onDelete: canUpdate ? setDeletingRole : undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canUpdate],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<RoleDTO, unknown>
        columns={columns as ColumnDef<RoleDTO, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        headerActions={
          (canCreate || canImport || canExport) && (
            <div className="flex gap-2">
              {(canImport || canExport) && (
                <EntityImportExportButton
                  title="Roles"
                  useImportHook={useImportRoles}
                  useExportHook={useExportRoles}
                  useTemplateHook={useDownloadRoleTemplate}
                />
              )}
              {canCreate && (
                <Button
                  onClick={openCreate}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Role
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

      {/* ===== Create / Update ===== */}
      <RoleFormModal
        open={isFormOpen}
        isEditMode={isEditMode}
        roleForm={roleForm}
        permissions={permissions}
        onChange={setRoleForm}
        onTogglePermission={(id) =>
          setRoleForm((prev) => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(id)
              ? prev.permissionIds.filter((p) => p !== id)
              : [...prev.permissionIds, id],
          }))
        }
        onSubmit={handleSubmit}
        onClose={() => setIsFormOpen(false)}
      />

      {/* ===== View detail ===== */}
      <RoleDetailDialog
        open={!!viewingRole}
        role={viewingRole}
        onClose={() => setViewingRole(null)}
      />

      {/* ===== Delete confirm ===== */}
      <ConfirmDialog
        open={!!deletingRole}
        title="Delete Role"
        description={`Are you sure you want to delete "${deletingRole?.name}"?`}
        onCancel={() => setDeletingRole(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
