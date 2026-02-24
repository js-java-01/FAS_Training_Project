import React from "react";
import { FiUser, FiFileText, FiLayers, FiShield, FiX } from "react-icons/fi";
import { Permission } from "../../../types/permission";
import { CreateRoleRequest } from "../../../types/role";

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
  if (!open) return null;

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
              Configure role information and modules
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
          {/* <div>
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
          </div> */}

          {/* MODULES */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FiShield /> Modules
            </label>

            <div className="border rounded-md bg-gray-50 max-h-36 overflow-y-auto p-2 space-y-1">
              {permissions.map((p) => (
                <label
                  key={p.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-white cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={roleForm.permissionIds.includes(p.id)}
                    onChange={() => onTogglePermission(p.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-500">{p.description}</p>
                  </div>
                </label>
              ))}
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
