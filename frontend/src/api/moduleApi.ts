import axiosInstance from './axiosInstance';
import type {
    ModuleGroup,
    Module,
    CreateModuleGroupRequest,
    CreateModuleRequest,
} from '../types/module';
import type { ApiResponse, PagedData} from "@/types/response.ts";

/* =========================
   MODULE GROUP API
========================= */

export const moduleGroupApi = {
    getAllModuleGroups: async (params: {
        page: number;
        size: number;
        sort: string;
        keyword?: string;
    }) => {
        const res = await axiosInstance.get<ApiResponse<PagedData<ModuleGroup>>>(
            "/module-groups",
            { params }
        );

        return res.data.data;
    },

    getAllModuleGroupsList: async (): Promise<ModuleGroup[]> => {
        const response = await axiosInstance.get<ModuleGroup[]>(
            '/module-groups/details'
        );
        return response.data;
    },

    getActiveModuleGroups: async (): Promise<ModuleGroup[]> => {
        const response = await axiosInstance.get<ModuleGroup[]>(
            '/module-groups/active'
        );
        return response.data;
    },

    getModuleGroupById: async (id: string): Promise<ModuleGroup> => {
        const response = await axiosInstance.get<ModuleGroup>(
            `/module-groups/${id}`
        );
        return response.data;
    },

    createModuleGroup: async (
        moduleGroup: CreateModuleGroupRequest
    ): Promise<ModuleGroup> => {
        const response = await axiosInstance.post<ModuleGroup>(
            '/module-groups',
            moduleGroup
        );
        return response.data;
    },

    updateModuleGroup: async (
        id: string,
        moduleGroup: Partial<ModuleGroup>
    ): Promise<ModuleGroup> => {
        const response = await axiosInstance.put<ModuleGroup>(
            `/module-groups/${id}`,
            moduleGroup
        );
        return response.data;
    },

    deleteModuleGroup: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/module-groups/${id}`);
    },

    toggleModuleGroupStatus: async (id: string): Promise<ModuleGroup> => {
        const response = await axiosInstance.post<ModuleGroup>(
            `/module-groups/${id}/toggle-status`
        );
        return response.data;
    },
    exportModuleGroups: async (params?: {
        keyword?: string;
        status?: string;
    }): Promise<Blob> => {
        const res = await axiosInstance.get(
            "/module-groups/export",
            {
                params,
                responseType: "blob",
            }
        );

        return res.data;
    },
    importModuleGroups: async (formData: FormData) => {
        return axiosInstance.post(
            "/module-groups/import",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },

};

/* =========================
   MODULE API
========================= */

export const moduleApi = {
    getAllModules: async (
        page = 0,
        size = 100,
        sort = 'displayOrder,asc'
    ) => {
        const response = await axiosInstance.get<{
            content: Module[];
            totalElements: number;
            totalPages: number;
        }>(`/modules?page=${page}&size=${size}&sort=${sort}`);

        return response.data;
    },

    getModulesByModuleGroup: async (
        moduleGroupId: string
    ): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(
            `/modules/module-group/${moduleGroupId}`
        );
        return response.data;
    },

    getRootModules: async (
        moduleGroupId: string
    ): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(
            `/modules/module-group/${moduleGroupId}/root`
        );
        return response.data;
    },

    getChildModules: async (parentId: string): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(
            `/modules/parent/${parentId}`
        );
        return response.data;
    },

    getModuleById: async (id: string): Promise<Module> => {
        const response = await axiosInstance.get<Module>(`/modules/${id}`);
        return response.data;
    },

    createModule: async (
        module: CreateModuleRequest
    ): Promise<Module> => {
        const response = await axiosInstance.post<Module>(
            '/modules',
            module
        );
        return response.data;
    },

    updateModule: async (
        id: string,
        module: Partial<Module>
    ): Promise<Module> => {
        const response = await axiosInstance.put<Module>(
            `/modules/${id}`,
            module
        );
        return response.data;
    },

    deleteModule: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/modules/${id}`);
    },

    toggleModuleStatus: async (id: string): Promise<Module> => {
        const response = await axiosInstance.post<Module>(
            `/modules/${id}/toggle-status`
        );
        return response.data;
    },

    exportModules: async (params?: {
        keyword?: string;
        status?: string;
    }): Promise<Blob> => {
        const res = await axiosInstance.get(
            "/modules/export",
            {
                params,
                responseType: "blob",
            }
        );

        return res.data;
    },
    importModules: async (formData: FormData) => {
        return axiosInstance.post(
            "/modules/import",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
    },

};
