import { createBaseApiService } from "@/api/base-service.api";
import axiosInstance from "@/api/axiosInstance";
import type { RoleDTO, RoleFilter, CreateRoleRequest, UpdateRoleRequest } from "@/types";

const path = "/roles";

const base = createBaseApiService<RoleDTO, RoleFilter>({
  path: path,
});

export interface RolePageResponse {
  items: RoleDTO[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export const roleApi = Object.assign({}, base, {
  /** Paginated list – maps Spring Page → { items, pagination } */
  getAllRoles: async (params: {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
    isActive?: boolean;
  } = {}): Promise<RolePageResponse> => {
    const { page = 0, size = 10, sort = "name,asc", keyword, isActive } = params;
    const reqParams: Record<string, unknown> = { page, size, sort };
    if (keyword?.trim()) reqParams.search = keyword.trim();
    if (isActive !== undefined) reqParams.isActive = isActive;
    const res = await axiosInstance.get<any>(path, { params: reqParams });
    const data = res.data;
    const items: RoleDTO[] = data.content ?? data.items ?? (Array.isArray(data) ? data : []);
    return {
      items,
      pagination: {
        page: data.number ?? page,
        pageSize: data.size ?? size,
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements ?? items.length,
      },
    };
  },

  createRole: async (data: CreateRoleRequest): Promise<RoleDTO> => {
    const res = await axiosInstance.post<RoleDTO>(path, data);
    return res.data;
  },

  updateRole: async (id: string, data: UpdateRoleRequest): Promise<RoleDTO> => {
    const res = await axiosInstance.put<RoleDTO>(`${path}/${id}`, { id, ...data });
    return res.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${path}/${id}`);
  },

  /** Toggle isActive by GET then PUT with flipped value */
  toggleRoleStatus: async (id: string): Promise<RoleDTO> => {
    const current = await axiosInstance.get<RoleDTO>(`${path}/${id}`);
    const role = current.data;
    const res = await axiosInstance.put<RoleDTO>(`${path}/${id}`, {
      ...role,
      isActive: !role.isActive,
    });
    return res.data;
  },

  exportRoles: async (): Promise<Blob> => {
    const res = await axiosInstance.get(`${path}/export`, {
      params: { format: "EXCEL" },
      responseType: "blob",
    });
    return res.data;
  },

  importRoles: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post(`${path}/import`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const res = await axiosInstance.get(`${path}/import/template`, {
      responseType: "blob",
    });
    return res.data;
  },
});
