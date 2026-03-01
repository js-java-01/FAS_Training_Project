import axiosInstance from './axiosInstance';
import type { Permission, CreatePermissionRequest } from '../types/permission';

export const permissionApi = {
  getAllPermissions: async (page = 0, size = 100, sort = 'name,asc') => {
    const response = await axiosInstance.get<{content: Permission[], totalElements: number, totalPages: number}>(
      `/permissions?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data;
  },

  getAllPermissionsList: async (): Promise<Permission[]> => {
    const response = await axiosInstance.get<Permission[]>('/permissions/list');
    return response.data;
  },

  getPermissionsByResource: async (): Promise<Record<string, Permission[]>> => {
    const response = await axiosInstance.get<Record<string, Permission[]>>('/permissions/by-resource');
    return response.data;
  },

  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await axiosInstance.get<Permission>(`/permissions/${id}`);
    return response.data;
  },

  createPermission: async (permission: CreatePermissionRequest): Promise<Permission> => {
    const response = await axiosInstance.post<Permission>('/permissions', permission);
    return response.data;
  },

  updatePermission: async (id: string, permission: Partial<Permission>): Promise<Permission> => {
    const response = await axiosInstance.put<Permission>(`/permissions/${id}`, permission);
    return response.data;
  },

  deletePermission: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/permissions/${id}`);
  },

  exportPermissions: async (): Promise<Blob> => {
    const res = await axiosInstance.get('/permissions/export', { responseType: 'blob' });
    return res.data;
  },

  importPermissions: async (formData: FormData) => {
    return axiosInstance.post('/permissions/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  downloadTemplate: async (): Promise<Blob> => {
    const res = await axiosInstance.get('/permissions/template', { responseType: 'blob' });
    return res.data;
  },
};
