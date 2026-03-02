import axiosInstance from "./axiosInstance";
import type {
  TrainingClass,
  CreateTrainingClassRequest,
  TrainingClassSemesterResponse,
} from "@/types/trainingClass";
import type { ApiResponse, PagedData } from "@/types/response";
import type { TraineeDetailsResponse } from "@/types/trainerClass";
import type { CourseDetailsResponse } from "@/types/course";

export const trainingClassApi = {
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
  },
  getTrainerClasses: async (params: {
    semesterId: string;
    keyword?: string;
    isActive?: boolean;
    classStatus?: string;
  }) => {
    const res = await axiosInstance.get<ApiResponse<TrainingClassSemesterResponse>>("/classes/trainer/my-classes", {
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