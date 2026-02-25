import axiosInstance from './axiosInstance';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/role';

// Spring Page response shape
interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;   // current page (0-based)
  size: number;
}

export interface RolePageResponse {
  items: Role[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export const roleApi = {
  getAllRoles: async (params: {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
  } = {}): Promise<RolePageResponse> => {
    const { page = 0, size = 10, sort = 'name,asc', keyword } = params;
    const response = await axiosInstance.get<SpringPage<Role>>('/roles', {
      params: { page, size, sort, ...(keyword?.trim() ? { keyword: keyword.trim() } : {}) },
    });
    const data = response.data;
    return {
      items: data.content,
      pagination: {
        page: data.number,
        pageSize: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      },
    };
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
};
