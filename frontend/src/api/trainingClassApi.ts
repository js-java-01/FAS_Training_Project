import axiosInstance from "./axiosInstance";
import type {
  TrainingClass,
  CreateTrainingClassRequest,
  TrainingClassSemesterResponse,
  UpdateTrainingClassRequest,
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
  approveClass: async (id: string, reason?: string): Promise<TrainingClass> => {
    const res = await axiosInstance.put<TrainingClass>(
      `/classes/${id}/approve`,
      { reviewReason: reason },
    );
    return res.data;
  },

  rejectClass: async (id: string, reason: string): Promise<TrainingClass> => {
    const res = await axiosInstance.put<TrainingClass>(
      `/classes/${id}/reject`,
      { reviewReason: reason },
    );
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