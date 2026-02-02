import React from 'react';
import type { User } from '@/types/user.ts';
import { PermissionGate } from '../../components/PermissionGate.tsx';

interface UserRowProps {
  user: User;
  onToggleStatus: (id: string) => void;
  onDeleteUser: (id: string) => void;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  onToggleStatus,
  onDeleteUser,
}) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        {user.firstName} {user.lastName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap">{user.roleName}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            user.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <PermissionGate permission="USER_ACTIVATE">
          <button
            onClick={() => onToggleStatus(user.id)}
            className="text-blue-600 hover:text-blue-900 mr-3"
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </PermissionGate>
        <PermissionGate permission="USER_DELETE">
          <button
            onClick={() => onDeleteUser(user.id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </PermissionGate>
      </td>
    </tr>
  );
};
