import React, { useState } from "react";
import {
  FiUser,
  FiFileText,
  FiLayers,
  FiShield,
  FiX,
  FiSearch,
} from "react-icons/fi";
import type { Permission } from "../../../types/permission";
import type { CreateRoleRequest } from "../../../types/role";

interface Props {
  open: boolean;
  isEditMode: boolean;
  roleForm: CreateRoleRequest;
  permissions: Permission[];
  onChange: (data: CreateRoleRequest) => void;
  onTogglePermission: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const RoleFormModal: React.FC<Props> = ({
  open,
  isEditMode,
  roleForm,
  permissions,
  onChange,
  onTogglePermission,
  onSubmit,
  onClose,
}) => {
  const [permissionSearch, setPermissionSearch] = useState("");

  if (!open) return null;

  const filteredPermissions = permissionSearch.trim()
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
          p.description?.toLowerCase().includes(permissionSearch.toLowerCase()),
      )
    : permissions;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Update Role" : "Create Role"}
            </h2>
            <p className="text-sm text-gray-500">
              Configure role information and permissions
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <FiX />
          </button>
        </div>

        <hr className="mb-4" />

        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* ROLE NAME */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiUser /> Role Name *
            </label>
            <input
              required
              value={roleForm.name}
              onChange={(e) => onChange({ ...roleForm, name: e.target.value })}
              className="mt-1 w-full border rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiFileText /> Description *
            </label>
            <textarea
              required
              rows={2}
              value={roleForm.description}
              onChange={(e) =>
                onChange({ ...roleForm, description: e.target.value })
              }
              className="mt-1 w-full border rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* LEVEL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiLayers /> Hierarchy Level
            </label>
            <input
              type="number"
              min={0}
              value={roleForm.hierarchyLevel}
              onChange={(e) =>
                onChange({
                  ...roleForm,
                  hierarchyLevel: Number(e.target.value),
                })
              }
              className="mt-1 w-full border rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-0.5">
              Lower number = higher privilege (e.g. 1 = Super Admin, 2 = Admin).
              0 = unset.
            </p>
          </div>

          {/* PERMISSIONS */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FiShield /> Permissions
            </label>

            {/* Search permissions */}
            <div className="relative mb-2">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                className="w-full border rounded-md pl-8 pr-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
            </div>

            <div className="border rounded-md bg-gray-50 max-h-48 overflow-y-auto p-2 space-y-1">
              {filteredPermissions.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-3">
                  No permissions found
                </p>
              )}
              {filteredPermissions.map((p) => {
                const isChecked = roleForm.permissionIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                      isChecked
                        ? "bg-gray-100 border-gray-300"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onTogglePermission(p.id)}
                      className="mt-1"
                    />
                    <div>
                      <p
                        className={`text-sm font-medium ${isChecked ? "text-gray-800" : "text-gray-800"}`}
                      >
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditMode ? "Update Role" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
