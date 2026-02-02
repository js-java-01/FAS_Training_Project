import React, { useEffect, useState } from "react";
import { roleApi } from "../../api/roleApi";
import { permissionApi } from "../../api/permissionApi";
import { Role, CreateRoleRequest } from "../../types/role";
import { Permission } from "../../types/permission";
import { MainLayout } from "../../components/MainLayout";
import { PermissionGate } from "../../components/PermissionGate";
import { FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { RoleImportModal } from "./components/RoleImportModal";
import { FiUploadCloud } from "react-icons/fi"; // Icon Import
import { FiDownload } from "react-icons/fi"; // Thêm FiDownload


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
  const [showImport, setShowImport] = useState(false);

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
  // Hàm xử lý Export
  const handleExport = async () => {
    try {
      // Hiện loading hoặc toast thông báo đang tải
      toast.info("Đang xuất dữ liệu...", { autoClose: 1000 });

      const blob = await roleApi.exportRoles();

      // Tạo link ảo để trình duyệt tải file về
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roles_export_${new Date().toISOString().slice(0,10)}.xlsx`; // Tên file kèm ngày
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Xuất file thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Xuất file thất bại!");
    }
  };
  

  if (loading) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      {/* HEADER */}
     
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <div className="flex gap-2"> {/* Gom nút Import và Create vào group */}
            
            {/* Nút Import - Chỉ hiện nếu có quyền ROLE_CREATE */}
            <PermissionGate permission="ROLE_CREATE">
                <button
                    onClick={() => setShowImport(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                    <FiUploadCloud /> Import
                </button>
            </PermissionGate>
            <PermissionGate permission="ROLE_READ">
            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
                <FiDownload /> Export
            </button>
        </PermissionGate>

            <PermissionGate permission="ROLE_CREATE">
            <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
                <FiPlus /> Create Role
            </button>
            </PermissionGate>
            </div>
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
      <RoleImportModal 
                open={showImport} 
                onClose={() => setShowImport(false)}
                onSuccess={() => loadData()} 
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
