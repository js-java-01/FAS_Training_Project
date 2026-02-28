import type { FileFormat, ImportResult, Pagination } from "@/types";
import type { PageResponse } from "@/types/common/pageable";
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
  return {
    import: async (file: File): Promise<ImportResult> => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await instance.post<ImportResult>(`${path}/import`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },

    export: async (format: FileFormat): Promise<Blob> =>
      (
        await instance.get(`${path}/export`, {
          params: { format },
          responseType: "blob",
        })
      ),

    getPage: async (
      pagination: Pagination,
      search?: string,
      filter?: Filter,
    ): Promise<PageResponse<Response>> =>
      (
        await instance.get<PageResponse<Response>>(path, {
          params: { ...pagination, search, ...filter },
        })
      ).data,

    getById: async (id: string): Promise<Response> =>
      (await instance.get<Response>(`${path}/${id}`)).data,

    create: async (data: CreateRequest): Promise<Response> =>
      (await instance.post<Response>(path, data)).data,

    update: async (id: string, data: UpdateRequest): Promise<Response> =>
      (await instance.put<Response>(`${path}/${id}`, data)).data,

    delete: async (id: string): Promise<void> =>
      (await instance.delete(`${path}/${id}`)).data,
  };
};
