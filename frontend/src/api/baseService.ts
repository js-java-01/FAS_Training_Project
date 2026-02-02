import type { PagedData, PaginationRequest } from "@/types/response";
import type { AxiosInstance } from "axios";

const toPageableParams = (pagination: PaginationRequest) => ({
  page: pagination.page - 1, // Spring dùng 0-based
  size: pagination.size,
  sort: pagination.sort || 'createdAt,desc',
});

export const createBaseCrudService = <
    ResponseDTO = any,
    CreateRequestDTO = any,
    UpdateRequestDTO = any,
    FilterDTO = any
>(
    instance: AxiosInstance,
    basePath: string
) => {
    return {
        getAll: async (
            keyword: string, 
            pagination: PaginationRequest, 
            filter?: FilterDTO
        ): Promise<PagedData<ResponseDTO>> => {
            const params = {
                ...(keyword && { keyword }),
                ...(pagination && toPageableParams(pagination)),
                ...(filter ?? {}),
            };

            const response = await instance.get<PagedData<ResponseDTO>>(basePath, {
                params,
            });
            return response.data;
        },

        getById: async (id: string): Promise<ResponseDTO> => {
            const response = await instance.get<ResponseDTO>(`${basePath}/${id}`);
            return response.data;
        },

        create: async (data: CreateRequestDTO): Promise<ResponseDTO> => {
            const response = await instance.post<ResponseDTO>(basePath, data);
            return response.data;
        },

        update: async (id: string, data: UpdateRequestDTO): Promise<ResponseDTO> => {
            const response = await instance.put<ResponseDTO>(`${basePath}/${id}`, data);
            return response.data;
        },

        delete: async (id: string): Promise<void> => {
            await instance.delete(`${basePath}/${id}`);
        },
    };
}