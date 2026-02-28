import axiosInstance from "./axiosInstance";
import type { TrainingClass, CreateTrainingClassRequest } from "@/types/trainingClass";
import type { ApiResponse, PagedData } from "@/types/response";
import type { TraineeDetailsResponse, TrainerClassSemesterResponse } from "@/types/trainerClass";
import type { CourseDetailsResponse } from "@/types/course";

export const trainingClassApi = {
  /* ============ SEARCH / LIST (paginated) ============ */
  getAllTrainingClasses: async (params: {
    page: number;
    size: number;
    sort: string;
    keyword?: string;
    isActive?: boolean;
  }) => {
    const res = await axiosInstance.get<ApiResponse<PagedData<TrainingClass>>>("/v1/open-class-requests", { params });
    return res.data.data;
  },

  /* ============ CREATE ============ */
  createTrainingClass: async (data: CreateTrainingClassRequest): Promise<TrainingClass> => {
    const res = await axiosInstance.post<TrainingClass>("/v1/open-class-requests", data);
    return res.data;
  },

  getTrainerClasses: async (params: {
    semesterId: string;
    keyword?: string;
    isActive?: boolean;
    classStatus?: string;
  }) => {
    const res = await axiosInstance.get<ApiResponse<TrainerClassSemesterResponse>>("/classes/trainer/my-classes", {
      params,
    });
    return res.data;
  },
};

export const classDetailsApi = {
  getTrainees: async (classId: string, params: any) => {
    const res = await axiosInstance.get(`/classes/trainer/${classId}/trainees`, { params });
    return res.data.data as PagedData<TraineeDetailsResponse>;
  },
  getCourses: async (classId: string, params: any) => {
    const res = await axiosInstance.get(`/classes/trainer/${classId}/courses`, { params });
    return res.data.data as PagedData<CourseDetailsResponse>;
  },
};
