import type { PageResponse, PaginationRequest } from "@/types/common/pageable";
import type { AxiosInstance } from "axios";

export const createBaseApiService = <
  Response = any,
  Filter = any,
  CreateRequest = any,
  UpdateRequest = any,
>(
  instance: AxiosInstance,
  path: string,
) => {
  if (!instance) throw new Error("Axios instance is required");
  if (!path) throw new Error("API path is required");
  if (Response === undefined || Response === null)
    throw new Error("Response type is required");
  
  if (!path.startsWith("/")) path = `/${path}`;

  return {
    search: async (
      keyword: string,
      pagination: PaginationRequest,
      filter?: Filter,
    ): Promise<PageResponse<Response>> => {
      const response = await instance.get<PageResponse<Response>>(path, {
        params: {
          keyword,
          ...buildPageParams(pagination),
          ...filter,
        },
      });
      return response.data;
    },

    getById: async (id: string): Promise<Response> => {
      if (!id) throw new Error("ID is required");

      const response = await instance.get<Response>(`${path}/${id}`);
      return response.data;
    },

    create: async (data: CreateRequest): Promise<Response> => {
      const response = await instance.post<Response>(path, data);
      return response.data;
    },

    update: async (id: string, data: UpdateRequest): Promise<Response> => {
      if (!id) throw new Error("ID is required");

      const response = await instance.put<Response>(`${path}/${id}`, data);
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      if (!id) throw new Error("ID is required");

      await instance.delete(`${path}/${id}`);
    },
  };
};

export const buildPageParams = (
  pagination?: PaginationRequest,
): Record<string, any> => {
  if (!pagination) return {};

  const params: Record<string, any> = {
    page: pagination.page ?? 0,
    size: pagination.size ?? 20,
  };

  if (pagination.sort?.length) {
    params.sort = pagination.sort.map(
      (s) => `${s.field},${s.direction ?? "asc"}`,
    );
  }

  return params;
};
