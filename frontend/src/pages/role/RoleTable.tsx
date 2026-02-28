import React, { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { AxiosError } from "axios";
import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import { roleApi } from "@/api/roleApi";
import { permissionApi } from "@/api/permissionApi";
import type { Role, CreateRoleRequest } from "@/types/role";
import type { Permission } from "@/types/permission";

import { getColumns } from "./columns";
import { RoleFormModal } from "./components/RoleFormModal";
import { RoleDetailDialog } from "./components/RoleDetailDialog";
import { ROLE_QUERY_KEY, useGetAllRoles } from "./services/queries";
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import { useDownloadRoleTemplate, useExportRoles, useImportRoles } from "./services/mutations";

/* ===================== MAIN ===================== */
export default function RoleTable() {
  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [roleForm, setRoleForm] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    hierarchyLevel: 1,
    permissionIds: [],
  });

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
      hierarchyLevel: 1,
      permissionIds: [],
    });
    const perms = await permissionApi.getAllPermissionsList();
    setPermissions(perms);
    setIsFormOpen(true);
  };

  /* ---------- open edit ---------- */
  const openEdit = async (role: Role) => {
    setIsEditMode(true);
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      hierarchyLevel: role.hierarchyLevel,
      permissionIds: role.permissionIds,
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
        await roleApi.updateRole(editingRole.id, roleForm);
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
      await roleApi.deleteRole(deletingRole.id);
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
        onEdit: openEdit,
        onDelete: setDeletingRole,
        onToggleStatus: handleToggleStatus,
      }),
    [],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<Role, unknown>
        columns={columns as ColumnDef<Role, unknown>[]}
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
        searchPlaceholder="role name"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        headerActions={
          <div className="flex gap-2">
            <EntityImportExportButton
              title="Roles"
              useImportHook={useImportRoles}
              useExportHook={useExportRoles}
              useTemplateHook={useDownloadRoleTemplate}
            />
            <Button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Role
            </Button>
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
