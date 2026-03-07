import type { UserDTO, UserFilter, PageResponse, ImportResult } from "@/types";
import { createBaseApiService } from "../../base-service.api";
import axiosInstance from "@/api/axiosInstance";

const path = "/users";

const base = createBaseApiService<UserDTO, UserFilter>({ path: path });

export const userApi = Object.assign({}, base, {
  getAllUsers: async (params: {
    page?: number;
    size?: number;
    sort?: string;
    searchContent?: string;
    isActive?: boolean;
  } = {}): Promise<PageResponse<UserDTO>> => {
    const { page = 0, size = 10, sort = "createdAt,desc", searchContent, isActive } = params;
    const response = await axiosInstance.get<PageResponse<UserDTO>>("/users", {
      params: {
        page, size, sort,
        ...(searchContent?.trim() ? { searchContent: searchContent.trim() } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    return response.data;
  },

  toggleUserStatus: async (id: string): Promise<UserDTO> => {
    const response = await axiosInstance.post<UserDTO>(`/users/${id}/toggle-status`);
    return response.data;
  },

  assignRole: async (userId: string, roleId: string): Promise<UserDTO> => {
    const response = await axiosInstance.post<UserDTO>(`/users/${userId}/assign-role`, { roleId });
    return response.data;
  },

  exportUsers: async (format: "EXCEL" | "CSV" | "PDF" = "EXCEL"): Promise<Blob> => {
    const response = await axiosInstance.get("/users/export", {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  importUsers: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<ImportResult>("/users/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  downloadUserTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get("/import/template", {
      params: { entity: "user" },
      responseType: "blob",
    });
    return response.data;
  },
});
