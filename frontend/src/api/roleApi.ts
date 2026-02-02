import axiosInstance from './axiosInstance';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/role';

export const roleApi = {
  getAllRoles: async (page = 0, size = 20, sort = 'name,asc') => {
    const response = await axiosInstance.get<{content: Role[], totalElements: number, totalPages: number}>(
      `/roles?page=${page}&size=${size}&sort=${sort}`
    );
    return response.data;
  },

  getRoleById: async (id: string): Promise<Role> => {
    const response = await axiosInstance.get<Role>(`/roles/${id}`);
    return response.data;
  },

  createRole: async (role: CreateRoleRequest): Promise<Role> => {
    const response = await axiosInstance.post<Role>('/roles', role);
    return response.data;
  },

  updateRole: async (id: string, role: UpdateRoleRequest): Promise<Role> => {
    const response = await axiosInstance.put<Role>(`/roles/${id}`, role);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/roles/${id}`);
  },

  toggleRoleStatus: async (id: string): Promise<Role> => {
    const response = await axiosInstance.post<Role>(`/roles/${id}/toggle-status`);
    return response.data;
  },

  addPermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    const response = await axiosInstance.post<Role>(`/roles/${roleId}/permissions/add`, { permissionIds });
    return response.data;
  },

  removePermissions: async (roleId: string, permissionIds: string[]): Promise<Role> => {
    const response = await axiosInstance.post<Role>(`/roles/${roleId}/permissions/remove`, { permissionIds });
    return response.data;
  },
<<<<<<< Updated upstream
=======
  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/roles/template', {
      responseType: 'blob', // Quan trọng: Báo cho axios biết đây là file binary
    });
    return response.data;
  },

  importRoles: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    await axiosInstance.post('/roles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  exportRoles: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/roles/export', {
      responseType: 'blob',
    });
    return response.data;
  },
>>>>>>> Stashed changes
};
