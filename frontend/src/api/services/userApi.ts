import type { CreateUserRequest, User, UserFilter } from '../../types/user';
import axiosInstance from '../axiosInstance';
import { createBaseCrudService } from '../baseService';
import { Domain } from '../domain';

const base = createBaseCrudService<User, CreateUserRequest, User, UserFilter>(
    axiosInstance,
    Domain.USER
);

export const userApi = Object.assign({}, base, {

    toggleUserStatus: async (id: string): Promise<User> => {
    const response = await axiosInstance.post<User>(`/users/${id}/toggle-status`);
    return response.data;
  },

  assignRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await axiosInstance.post<User>(`/users/${userId}/assign-role`, { roleId });
    return response.data;
  },

});
