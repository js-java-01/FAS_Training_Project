import axiosInstance from './axiosInstance';
import type { Department, CreateDepartmentRequest } from '@/types/department';

export interface DepartmentPageResponse {
    items: Department[];
    pagination: {
        page: number;
        pageSize: number;
        totalPages: number;
        totalElements: number;
    };
}

export const departmentApi = {
    // ================= GET ALL (returns paged wrapper) =================
    getAll: async (params: {
        page?: number;
        size?: number;
        sort?: string;
        keyword?: string;
    } = {}): Promise<DepartmentPageResponse> => {
        const { page = 0, size = 10, sort = 'name,asc', keyword } = params;
        const response = await axiosInstance.get<Department[]>('/departments', {
            params: { page, size, sort, ...(keyword?.trim() ? { q: keyword.trim() } : {}) },
        });
        const data = response.data;
        // Backend returns plain list — wrap into page-like structure
        const arr = Array.isArray(data) ? data : [];
        return {
            items: arr,
            pagination: {
                page,
                pageSize: size,
                totalPages: Math.max(1, Math.ceil(arr.length / size)),
                totalElements: arr.length,
            },
        };
    },

    // ================= GET BY ID =================
    getById: async (id: string) => {
        const response = await axiosInstance.get<Department>(`/departments/${id}`);
        return response.data;
    },

    // ================= CREATE =================
    create: async (data: CreateDepartmentRequest) => {
        const response = await axiosInstance.post<Department>('/departments/create', data);
        return response.data;
    },

    // ================= UPDATE =================
    update: async (id: string, data: Partial<CreateDepartmentRequest>) => {
        const response = await axiosInstance.put<Department>(`/departments/${id}`, data);
        return response.data;
    },

    // ================= DELETE =================
    delete: async (id: string) => {
        await axiosInstance.delete(`/departments/${id}`);
    },

    // ================= EXPORT =================
    export: async (): Promise<Blob> => {
        const response = await axiosInstance.get('/departments/export', {
            params: { format: 'xlsx' },
            responseType: 'blob',
        });
        return response.data;
    },

    // ================= DOWNLOAD IMPORT TEMPLATE =================
    downloadTemplate: async (): Promise<Blob> => {
        const response = await axiosInstance.get('/departments/import/template', {
            responseType: 'blob',
        });
        return response.data;
    },

    // ================= IMPORT =================
    import: async (file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);
        await axiosInstance.post('/departments/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};