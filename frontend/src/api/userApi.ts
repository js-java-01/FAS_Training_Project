import axiosInstance from './axiosInstance';
import type { User, CreateUserRequest } from '../types/auth';
import type { ImportResult } from '@/components/modal/import-export/ImportTab';

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
    isActive?: boolean;
  } = {}): Promise<UserPageResponse> => {
    const { page = 0, size = 10, sort = 'createdAt,desc', searchContent, isActive } = params;
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
        ...(isActive !== undefined ? { isActive } : {}),
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

  importUsers: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ImportResult>('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadUserTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/users/import/template', {
      responseType: 'blob',
    });
    return response.data;
  },
};
