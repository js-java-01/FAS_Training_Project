import axiosInstance from "./axiosInstance";
import type {
    TrainingClass,
    CreateTrainingClassRequest,
    TrainingClassSemesterResponse,
} from "@/types/trainingClass";
import type { ApiResponse, PagedData } from "@/types/response";

export const trainingClassApi = {
    /* ============ SEARCH / LIST (paginated) ============ */
    getAllTrainingClasses: async (params: {
        page: number;
        size: number;
        sort?: string;
        keyword?: string;
        isActive?: boolean;
        semesterId?: string;
        trainerId?: string;
    }) => {
        const res = await axiosInstance.get<ApiResponse<PagedData<TrainingClass>>>(
            "/classes",
            { params },
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
    getMyClasses: async () => {
        const res = await axiosInstance.get<ApiResponse<TrainingClassSemesterResponse[]>>(
            `/classes/me`,
        );
        return res.data;
    }

};
