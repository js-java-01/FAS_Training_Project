import axiosInstance from "./axiosInstance";
import type {
    TrainingClass,
    CreateTrainingClassRequest,
    UpdateTrainingClassRequest,
} from "@/types/trainingClass";
import type { ApiResponse, PagedData } from "@/types/response";

export const trainingClassApi = {
    /* ============ SEARCH / LIST (paginated) ============ */
    getAllTrainingClasses: async (params: {
        page: number;
        size: number;
        sort: string;
        keyword?: string;
        isActive?: boolean;
    }) => {
        const res = await axiosInstance.get<ApiResponse<PagedData<TrainingClass>>>(
            "/classes",
            { params },
        );
        return res.data.data;
    },

    /* ============ GET BY ID ============ */
    getTrainingClassById: async (id: string): Promise<TrainingClass> => {
        const res = await axiosInstance.get<ApiResponse<TrainingClass>>(
            `/classes/${id}`,
        );
        return res.data.data;
    },

    /* ============ CREATE ============ */
    createTrainingClass: async (
        data: CreateTrainingClassRequest,
    ): Promise<TrainingClass> => {
        const res = await axiosInstance.post<TrainingClass>(
            "/classes",
            data,
        );
        return res.data;
    },

    /* ============ UPDATE ============ */
    updateTrainingClass: async (
        id: string,
        data: UpdateTrainingClassRequest,
    ): Promise<TrainingClass> => {
        const res = await axiosInstance.put<ApiResponse<TrainingClass>>(
            `/classes/${id}`,
            data,
        );
        return res.data.data;
    },

    /* ============ APPROVE ============ */
    approveClass: async (id: string, reason?: string): Promise<TrainingClass> => {
        const res = await axiosInstance.put<TrainingClass>(
            `/classes/${id}/approve`,
            { reviewReason: reason },
        );
        return res.data;
    },

    /* ============ REJECT ============ */
    rejectClass: async (id: string, reason: string): Promise<TrainingClass> => {
        const res = await axiosInstance.put<TrainingClass>(
            `/classes/${id}/reject`,
            { reviewReason: reason },
        );
        return res.data;
    },
};
