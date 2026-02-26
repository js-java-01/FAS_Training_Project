import React, { useState, useEffect } from 'react';
import { roleApi } from '../api/roleApi';
import { permissionApi } from '../api/permissionApi';
import type { Role, CreateRoleRequest } from '../types/role';
import type { Permission } from '../types/permission';
import { PermissionGate } from '../components/PermissionGate';
import { MainLayout } from '../components/layout/MainLayout.tsx';
import MainHeader from '@/components/layout/MainHeader.tsx';

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState<CreateRoleRequest>({
    name: '',
    description: '',
    hierarchyLevel: 1,
    permissionIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        roleApi.getAllRoles(),
        permissionApi.getAllPermissionsList(),
      ]);
      setRoles(rolesData.content);
      setPermissions(permissionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await roleApi.createRole(newRole);
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', hierarchyLevel: 1, permissionIds: [] });
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating role');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await roleApi.toggleRoleStatus(id);
      loadData();
    } catch (error) {
      alert('Error toggling role status');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleApi.deleteRole(id);
        loadData();
      } catch (error) {
        alert('Error deleting role');
      }
    }
  };

  const togglePermission = (permissionId: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pathName={{ roles: 'Role Management' }}>
      <div className="flex justify-between items-center mb-6">
        <MainHeader title={"Role Management"}/>
        <PermissionGate permission="ROLE_CREATE">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Role
          </button>
        </PermissionGate>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${role.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {role.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                    Level {role.hierarchyLevel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{role.description}</p>
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissionNames.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <PermissionGate permission="ROLE_UPDATE">
                  <button
                    onClick={() => handleToggleStatus(role.id)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                  >
                    {role.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </PermissionGate>
                <PermissionGate permission="ROLE_DELETE">
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
            <h2 className="text-xl font-bold mb-4">Create New Role</h2>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role Name</label>
                <input
                  type="text"
                  required
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  required
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hierarchy Level</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newRole.hierarchyLevel}
                  onChange={(e) =>
                    setNewRole({ ...newRole, hierarchyLevel: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
                  {permissions.map((permission) => (
                    <label key={permission.id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={newRole.permissionIds.includes(permission.id)}
                        onChange={() => togglePermission(permission.id)}
                        className="rounded"
                      />
                      <span className="text-sm">
                        {permission.name} - {permission.description}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};
