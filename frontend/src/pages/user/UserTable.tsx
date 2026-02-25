import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { AxiosError } from "axios";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import { userApi } from "@/api/userApi";
import { roleApi } from "@/api/roleApi";
import type { User, CreateUserRequest } from "@/types/auth";
import type { Role } from "@/types/role";

import { getColumns } from "./column";
import { UserForm } from "./UserForm";
import { UserDetailDialog } from "./UserDetailDialog";
import { USER_QUERY_KEY, useGetAllUsers } from "./services/queries";
import { useExportUsers } from "./services/mutations";

/* ===================== MAIN ===================== */
export default function UserTable() {
  /* ---------- modal & view ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

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
    if (!sorting.length) return "createdAt,desc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ---------- mutations ---------- */
  const { mutateAsync: exportUsers } = useExportUsers();

  /* ---------- query ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllUsers({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    searchContent: debouncedSearch,
  });

  const safeTableData = useMemo(
    () => ({
      items: tableData?.items ?? [],
      page: tableData?.pagination?.page ?? pageIndex,
      pageSize: tableData?.pagination?.pageSize ?? pageSize,
      totalPages: tableData?.pagination?.totalPages ?? 0,
    }),
    [tableData, pageIndex, pageSize],
  );

  /* ---------- helpers ---------- */
  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
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

  /* ---------- load roles for form ---------- */
  const loadRoles = async () => {
    try {
      const res = await roleApi.getAllRoles({ size: 100 });
      setRoles(res.items);
    } catch {
      toast.error("Failed to load roles");
    }
  };

  /* ---------- open create ---------- */
  const openCreate = async () => {
    setEditingUser(null);
    await loadRoles();
    setIsFormOpen(true);
  };

  /* ---------- open edit ---------- */
  const openEdit = async (user: User) => {
    setEditingUser(user);
    await loadRoles();
    setIsFormOpen(true);
  };

  /* ---------- create ---------- */
  const handleCreate = async (data: CreateUserRequest | Partial<User>) => {
    try {
      await userApi.createUser(data as CreateUserRequest);
      toast.success("User created successfully");
      setIsFormOpen(false);
      await invalidateUsers();
      await reload();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create user");
      }
      throw error;
    }
  };

  /* ---------- update ---------- */
  const handleUpdate = async (data: CreateUserRequest | Partial<User>) => {
    if (!editingUser?.id) return;
    try {
      await userApi.updateUser(editingUser.id, data as Partial<User>);
      toast.success("User updated successfully");
      setIsFormOpen(false);
      setEditingUser(null);
      await invalidateUsers();
      await reload();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update user");
      }
      throw error;
    }
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await userApi.deleteUser(deletingUser.id);
      toast.success("User deleted successfully");
      await invalidateUsers();
      await reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    } finally {
      setDeletingUser(null);
    }
  };

  /* ---------- toggle status ---------- */
  const handleToggleStatus = async (id: string) => {
    try {
      await userApi.toggleUserStatus(id);
      toast.success("User status updated");
      await invalidateUsers();
      await reload();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  /* ---------- export ---------- */
  const handleExport = async () => {
    try {
      const blob = await exportUsers("EXCEL");
      downloadBlob(blob, `users_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Export users successfully");
    } catch {
      toast.error("Failed to export users");
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: setViewingUser,
        onEdit: openEdit,
        onDelete: setDeletingUser,
        onToggleStatus: handleToggleStatus,
      }),
    [],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<User, unknown>
        columns={columns as ColumnDef<User, unknown>[]}
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
        searchPlaceholder="name, email"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        headerActions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={openCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New User
            </Button>
          </div>
        }
      />

      {/* ===== Create / Update ===== */}
      <UserForm
        open={isFormOpen}
        initial={editingUser}
        roles={roles}
        onClose={() => {
          setIsFormOpen(false);
          setEditingUser(null);
        }}
        onSaved={editingUser ? handleUpdate : handleCreate}
      />

      {/* ===== View detail ===== */}
      <UserDetailDialog
        open={!!viewingUser}
        user={viewingUser}
        onClose={() => setViewingUser(null)}
      />

      {/* ===== Delete confirm ===== */}
      <ConfirmDialog
        open={!!deletingUser}
        title="Delete User"
        description={`Are you sure you want to delete "${deletingUser?.firstName} ${deletingUser?.lastName}"?`}
        onCancel={() => setDeletingUser(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
