import React, { useEffect, useState } from "react";
import { roleApi } from "../../api/roleApi";
import { permissionApi } from "../../api/permissionApi";
import { Role, CreateRoleRequest } from "../../types/role";
import { Permission } from "../../types/permission";
import { MainLayout } from "../../components/MainLayout";
import { PermissionGate } from "../../components/PermissionGate";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";


import { RoleCard } from "./components/RoleCard";
import { RoleFormModal } from "./components/RoleFormModal";
import { RoleDetailModal } from "./components/RoleDetailModal";

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [roleForm, setRoleForm] = useState<CreateRoleRequest>({
    name: "",
    description: "",
    hierarchyLevel: 1,
    permissionIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [r, p] = await Promise.all([
      roleApi.getAllRoles(),
      permissionApi.getAllPermissionsList(),
    ]);
    setRoles(r.content);
    setPermissions(p);
    setLoading(false);
  };

  const openCreate = () => {
    setIsEditMode(false);
    setRoleForm({
      name: "",
      description: "",
      hierarchyLevel: 1,
      permissionIds: [],
    });
    setShowForm(true);
  };

  const openEdit = (role: Role) => {
    setIsEditMode(true);
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      hierarchyLevel: role.hierarchyLevel,
      permissionIds: role.permissionIds,
    });
    setShowForm(true);
  };

  const submitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedRole) {
        await roleApi.updateRole(selectedRole.id, roleForm);
        toast.success("Role updated successfully");
      } else {
        await roleApi.createRole(roleForm);
        toast.success("Role created successfully");
      }
      setShowForm(false);
      loadData();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to save role";
      toast.error(message);
    }
  };

  if (loading) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <PermissionGate permission="ROLE_CREATE">
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            <FiPlus /> Create Role
          </button>
        </PermissionGate>
      </div>

      <RoleCard
        roles={roles}
        onView={(r) => {
          setSelectedRole(r);
          setShowDetail(true);
        }}
        onEdit={openEdit}
        onToggleStatus={async (id) => {
          try {
            await roleApi.toggleRoleStatus(id);
            toast.success("Role status updated");
            loadData();
          } catch (error: any) {
            const message = error?.response?.data?.message || "Failed to update status";
            toast.error(message);
          }
        }}
        onDelete={async (id) => {
          if (window.confirm("Are you sure you want to delete this role? This cannot be undone.")) {
            try {
              await roleApi.deleteRole(id);
              toast.success("Role deleted successfully");
              loadData();
            } catch (error: any) {
              console.error("Delete failed:", error);
              const message = error?.response?.data?.message || "Failed to delete role. It might be assigned to existing users.";
              toast.error(message);
            }
          }
        }}
      />

      <RoleFormModal
        open={showForm}
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
        onSubmit={submitRole}
        onClose={() => setShowForm(false)}
      />

      <RoleDetailModal
        open={showDetail}
        role={selectedRole}
        onClose={() => setShowDetail(false)}
      />
    </MainLayout>
  );
};
