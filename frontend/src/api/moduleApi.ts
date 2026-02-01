// src/api/moduleApi.ts

import axiosInstance from './axiosInstance';
import type {
    ModuleGroup,
    Module,
    CreateModuleGroupRequest,
    CreateModuleRequest,
} from '../types/module';

/* =========================
   MODULE GROUP API (Giữ nguyên)
========================= */
export const moduleGroupApi = {
    getAllModuleGroups: async (
        page = 0,
        size = 20,
        sort = 'asc' // FIX: Backend chỉ nhận 'asc' hoặc 'desc'
    ) => {
        const response = await axiosInstance.get(
            `/module-groups?page=${page}&size=${size}&sort=${sort}`
        );
        return response.data;
    },
    getAllModuleGroupsList: async (): Promise<ModuleGroup[]> => {
        const response = await axiosInstance.get<ModuleGroup[]>('/module-groups/details');
        return response.data;
    },
    getActiveModuleGroups: async (): Promise<ModuleGroup[]> => {
        const response = await axiosInstance.get<ModuleGroup[]>('/module-groups/active');
        return response.data;
    },
    getModuleGroupById: async (id: string): Promise<ModuleGroup> => {
        const response = await axiosInstance.get<ModuleGroup>(`/module-groups/${id}`);
        return response.data;
    },
    createModuleGroup: async (moduleGroup: CreateModuleGroupRequest): Promise<ModuleGroup> => {
        const response = await axiosInstance.post<ModuleGroup>('/module-groups', moduleGroup);
        return response.data;
    },
    updateModuleGroup: async (id: string, moduleGroup: Partial<ModuleGroup>): Promise<ModuleGroup> => {
        const response = await axiosInstance.put<ModuleGroup>(`/module-groups/${id}`, moduleGroup);
        return response.data;
    },
    deleteModuleGroup: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/module-groups/${id}`);
    },
    toggleModuleGroupStatus: async (id: string): Promise<ModuleGroup> => {
        const response = await axiosInstance.post<ModuleGroup>(`/module-groups/${id}/toggle-status`);
        return response.data;
    },
};

/* =========================
   MODULE API (Đã sửa sort)
========================= */
export const moduleApi = {
    getAllModules: async (
        page = 0,
        size = 100,
        sort = 'asc' // FIX: Backend hardcode sort theo displayOrder, chỉ nhận chiều 'asc'/'desc'
    ) => {
        // Backend trả về ApiResponse<PageResponse<ModuleDetail>>
        // axiosInstance thường trả về body json
        const response = await axiosInstance.get(
            `/modules?page=${page}&size=${size}&sort=${sort}`
        );
        return response.data;
    },

    getModulesByModuleGroup: async (moduleGroupId: string): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(`/modules/module-group/${moduleGroupId}`);
        return response.data;
    },
    getRootModules: async (moduleGroupId: string): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(`/modules/module-group/${moduleGroupId}/root`);
        return response.data;
    },
    getChildModules: async (parentId: string): Promise<Module[]> => {
        const response = await axiosInstance.get<Module[]>(`/modules/parent/${parentId}`);
        return response.data;
    },
    getModuleById: async (id: string): Promise<Module> => {
        const response = await axiosInstance.get<Module>(`/modules/${id}`);
        return response.data;
    },
    createModule: async (module: CreateModuleRequest): Promise<Module> => {
        const response = await axiosInstance.post<Module>('/modules', module);
        return response.data;
    },
    updateModule: async (id: string, module: Partial<Module> | CreateModuleRequest): Promise<Module> => {
        const response = await axiosInstance.put<Module>(`/modules/${id}`, module);
        return response.data;
    },
    deleteModule: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/modules/${id}`);
    },
    toggleModuleStatus: async (id: string): Promise<Module> => {
        const response = await axiosInstance.post<Module>(`/modules/${id}/toggle-status`);
        return response.data;
    },
};