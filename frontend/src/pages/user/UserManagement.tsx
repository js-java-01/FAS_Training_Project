import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { userApi } from '@/api/services/userApi';
import { roleApi } from '@/api/services/roleApi';

import type { Role } from '@/types/role';
import type { CreateUserRequest } from '@/types/user';

import { PermissionGate } from '@/components/PermissionGate';
import { MainLayout } from '@/components/layout/MainLayout';

import { UserTable } from './UserTable';
import { CreateUserModal } from './CreateUserModal';
import { useGetAllUsers } from '@/queries/user';


export const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();

  // 🔹 query params (sau này mở rộng pagination / filter)
  const usersQuery = useGetAllUsers({
    keyword: '',
    pagination: {
      page: 0,
      size: 10,
      sort: 'createdAt,desc',
    },
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newUser, setNewUser] = useState<CreateUserRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roleId: '',
  });

  // 🔹 load roles (có thể tách ra useQuery sau)
  React.useEffect(() => {
    roleApi.getAllRoles().then(res => setRoles(res.content));
  }, []);

  // =======================
  // Handlers
  // =======================

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.create(newUser);

      setShowCreateModal(false);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: '',
      });

      // 🔥 auto reload users
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await userApi.toggleUserStatus(id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      alert('Error toggling user status');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch {
      alert('Error deleting user');
    }
  };

  // =======================
  // Render
  // =======================

  if (usersQuery.isLoading) {
    return (
      <MainLayout>
        <div className="p-8">Loading...</div>
      </MainLayout>
    );
  }

  if (usersQuery.isError) {
    return (
      <MainLayout>
        <div className="p-8 text-red-600">
          Failed to load users
        </div>
      </MainLayout>
    );
  }

  const users = usersQuery.data?.items ?? [];

  return (
    <MainLayout pathName={{ users: 'User Management' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          User Management
        </h1>

        <PermissionGate permission="USER_CREATE">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create User
          </button>
        </PermissionGate>
      </div>

      <UserTable
        users={users}
        onToggleStatus={handleToggleStatus}
        onDeleteUser={handleDeleteUser}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        userData={newUser}
        onUserDataChange={setNewUser}
        roles={roles}
      />
    </MainLayout>
  );
};
