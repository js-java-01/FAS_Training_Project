import axiosInstance from './axiosInstance';
import type { User, CreateUserRequest } from '../types/auth';

export interface UserPageResponse {
  items: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export const userApi = {
  getAllUsers: async (params: {
    page?: number;
    size?: number;
    sort?: string;
    searchContent?: string;
  } = {}): Promise<UserPageResponse> => {
    const { page = 0, size = 10, sort = 'createdAt,desc', searchContent } = params;
    const response = await axiosInstance.get<{
      content: User[];
      number: number;
      size: number;
      totalPages: number;
      totalElements: number;
    }>('/users', {
      params: {
        page, size, sort,
        ...(searchContent?.trim() ? { searchContent: searchContent.trim() } : {}),
      },
    });
    const d = response.data;
    return {
      items: d.content,
      pagination: {
        page: d.number,
        pageSize: d.size,
        totalPages: d.totalPages,
        totalElements: d.totalElements,
      },
    };
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

  exportUsers: async (format: 'EXCEL' | 'CSV' | 'PDF' = 'EXCEL'): Promise<Blob> => {
    const response = await axiosInstance.get('/users/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};
