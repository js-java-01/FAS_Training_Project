import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiUploadCloud,
  FiDownload,
  FiX,
  FiShield,
  FiChevronDown,
  FiFileText,
  FiLayers,
  FiClock,
} from "react-icons/fi";
import { toast } from "sonner";

import { roleApi } from "../../api/roleApi";
import { permissionApi } from "../../api/permissionApi";
import { MainLayout } from "../../components/layout/MainLayout";

import { PermissionGate } from "../../components/PermissionGate";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";

import { RoleCard } from "./components/RoleCard";
import { RoleFormModal } from "./components/RoleFormModal";
import { ImportExportActions } from "@/components/import-export/ImportExportActions";
import { BaseImportModal } from "@/components/import-export/BaseImportModal";
import type { CreateRoleRequest, Role } from "@/types/role";
import type { Permission } from "@/types/permission";

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  const [expandPermissions, setExpandPermissions] = useState(false);
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

  /* ================= CREATE / EDIT ================= */

  const openCreate = () => {
    setIsEditMode(false);
    setSelectedRole(null);
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
      toast.error(error?.response?.data?.message || "Failed to save role");
    }
  };

  /* ================= EXPORT ================= */

  const handleExport = async () => {
    try {
      const blob = await roleApi.exportRoles();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roles_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Xuất file thành công!");
    } catch {
      toast.error("Xuất file thất bại!");
    }
  };

  if (loading) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>

        <div className="flex gap-2">
          <PermissionGate permission="ROLE_CREATE">
            <ImportExportActions onImportClick={() => setShowImport(true)} />
          </PermissionGate>

          <PermissionGate permission="ROLE_READ">
            <ImportExportActions onExportClick={handleExport} />
          </PermissionGate>

          <PermissionGate permission="ROLE_CREATE">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
            >
              <FiPlus /> Create Role
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* ================= ROLE LIST ================= */}
      <RoleCard
        roles={roles}
        onView={(role) => {
          setSelectedRole(role);
          setExpandPermissions(false);
          setShowDetail(true);
        }}
        onEdit={openEdit}
        onToggleStatus={async (id) => {
          try {
            await roleApi.toggleRoleStatus(id);
            toast.success("Role status updated");
            loadData();
          } catch (error: any) {
            toast.error(
              error?.response?.data?.message || "Failed to update status",
            );
          }
        }}
        onDelete={(role) => {
          setSelectedRole(role);
          setDeleteRoleId(role.id);
        }}
      />

      {/* ================= DETAIL MODAL (INLINE – GỘP) ================= */}
      {showDetail && selectedRole && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-50 rounded-xl p-6 w-full max-w-2xl relative">
            <button
              onClick={() => {
                setShowDetail(false);
                setSelectedRole(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <FiX size={20} />
            </button>

            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FiShield /> Role details
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Overview and update history for this role
            </p>

            <div className="bg-white border rounded-xl divide-y">
              <div className="p-4">
                <h3 className="font-semibold">{selectedRole.name}</h3>
                <p className="text-xs text-gray-500">ID: #{selectedRole.id}</p>
              </div>

              <Row
                icon={<FiFileText size={14} />}
                label="Description"
                value={selectedRole.description || "No description"}
              />

              <div className="p-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-gray-500">
                    <FiLayers size={14} /> Permissions
                  </span>
                  <button
                    onClick={() => setExpandPermissions(!expandPermissions)}
                    className="flex items-center gap-1"
                  >
                    {selectedRole.permissionNames?.length || 0}
                    <FiChevronDown
                      className={`transition ${
                        expandPermissions ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                {expandPermissions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedRole.permissionNames?.map((p) => (
                      <span
                        key={p}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Row
                icon={<FiClock size={14} />}
                label="Created At"
                value={formatDate(selectedRole.createdAt)}
              />
              <Row
                icon={<FiClock size={14} />}
                label="Updated At"
                value={formatDate(selectedRole.updatedAt)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRM ================= */}
      <ConfirmDeleteModal
        open={!!deleteRoleId}
        title="Delete role?"
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {selectedRole?.name}
            </span>
            ? This action cannot be undone.
          </>
        }
        onCancel={() => setDeleteRoleId(null)}
        onConfirm={async () => {
          if (!deleteRoleId) return;
          await roleApi.deleteRole(deleteRoleId);
          toast.success("Role deleted");
          setDeleteRoleId(null);
          loadData();
        }}
      />

      {/* ================= OTHER MODALS ================= */}
      <BaseImportModal
        open={showImport}
        title="Import Roles"
        description="Upload an Excel file to import roles. Download the template to see required format."
        templateFileName="roles_import_template.xlsx"
        onClose={() => setShowImport(false)}
        onSuccess={loadData}
        onDownloadTemplate={roleApi.downloadTemplate}
        onImport={roleApi.importRoles}
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
    </MainLayout>
  );
};

/* ================= HELPERS ================= */

const Row = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="p-4 flex justify-between text-sm">
    <span className="flex items-center gap-2 text-gray-500">
      {icon} {label}
    </span>
    <span>{value}</span>
  </div>
);

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleString() : "Unknown";
