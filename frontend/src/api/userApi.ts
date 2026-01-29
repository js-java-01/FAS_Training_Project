import axiosInstance from './axiosInstance';
import { User, CreateUserRequest } from '../types/auth';

export const userApi = {
  getAllUsers: async (page = 0, size = 20, sort = 'createdAt,desc') => {
    const response = await axiosInstance.get<{content: User[], totalElements: number, totalPages: number}>(
      `/users?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  },

  createUser: async (user: CreateUserRequest): Promise<User> => {
    const response = await axiosInstance.post<User>('/users', user);
    return response.data;
  },

  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<User>(`/users/${id}`, user);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`);
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await axiosInstance.post<User>(`/users/${id}/toggle-status`);
    return response.data;
  },

  assignRole: async (userId: string, roleId: string): Promise<User> => {
    const response = await axiosInstance.post<User>(`/users/${userId}/assign-role`, { roleId });
    return response.data;
  },
};
