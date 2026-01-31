import React, { useEffect, useState } from "react";
import { roleApi } from "../../api/roleApi";
import { permissionApi } from "../../api/permissionApi";
import { Role, CreateRoleRequest } from "../../types/role";
import { Permission } from "../../types/permission";
import { MainLayout } from "../../components/MainLayout";
import { PermissionGate } from "../../components/PermissionGate";
import { FiPlus } from "react-icons/fi";

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
    if (isEditMode && selectedRole) {
      await roleApi.updateRole(selectedRole.id, roleForm);
    } else {
      await roleApi.createRole(roleForm);
    }
    setShowForm(false);
    loadData();
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
          await roleApi.toggleRoleStatus(id);
          loadData();
        }}
        onDelete={async (id) => {
          if (confirm("Delete role?")) {
            await roleApi.deleteRole(id);
            loadData();
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
