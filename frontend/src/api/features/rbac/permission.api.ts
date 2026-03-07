import { createBaseApiService } from "@/api/base-service.api";
import axiosInstance from "@/api/axiosInstance";
import type { PermissionDTO, PermissionFilter } from "@/types";

const path = "/permissions";

const base = createBaseApiService<PermissionDTO, PermissionFilter>({
  path: path,
});

export const permissionApi = Object.assign({}, base, {
  /** Fetch all permissions (up to 1000) as a flat list — for use in dropdowns / form modals */
  getAllPermissionsList: async (): Promise<PermissionDTO[]> => {
    const res = await axiosInstance.get<any>(path, {
      params: { page: 0, size: 1000, sort: "name,asc" },
    });
    const data = res.data;
    return data.content ?? data.items ?? (Array.isArray(data) ? data : []);
  },

  /** Paginated list – maps Spring Page → { items, pagination } */
  getAllPermissions: async (
    page = 0,
    size = 50,
    sort = "name,asc",
    params: Record<string, unknown> = {}
  ) => {
    const res = await axiosInstance.get<any>(path, {
      params: { page, size, sort, ...params },
    });
    const data = res.data;
    const items: PermissionDTO[] = data.content ?? data.items ?? (Array.isArray(data) ? data : []);
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
});
