import axiosInstance from "./axiosInstance";
import type {
    TrainingClass,
    CreateTrainingClassRequest,
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
};
