import axiosInstance from "./axiosInstance";
import type { ApiResponse, PagedData } from "@/types/response";
import type {
  TrainingProgram,
  TrainingProgramRequest,
} from "@/types/trainingProgram";

export const trainingProgramApi = {
  getTrainingProgramById: async (id: string): Promise<TrainingProgram> => {
    const response = await axiosInstance.get<TrainingProgram>(
      `/training-programs/${id}`,
    );
    return response.data;
  },

  getAllTrainingPrograms: async (params: {
    page: number;
    size: number;
    sort: string;
    keyword?: string;
  }): Promise<PagedData<TrainingProgram>> => {
    const response = await axiosInstance.get<ApiResponse<PagedData<TrainingProgram>>>(
      "/training-programs",
      { params },
    );
    return response.data.data;
  },

  createTrainingProgram: async (
    data: TrainingProgramRequest,
  ): Promise<TrainingProgram> => {
    const response = await axiosInstance.post<TrainingProgram>(
      "/training-programs",
      data,
    );
    return response.data;
  },

  updateTrainingProgram: async (
    id: string,
    data: Partial<TrainingProgramRequest>,
  ): Promise<TrainingProgram> => {
    const response = await axiosInstance.put<TrainingProgram>(
      `/training-programs/${id}`,
      data,
    );
    return response.data;
  },

  deleteTrainingProgram: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/training-programs/${id}`);
  },

  exportTrainingPrograms: async (): Promise<Blob> => {
    const response = await axiosInstance.get("/training-programs/export", {
      responseType: "blob",
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get("/training-programs/template", {
      responseType: "blob",
    });
    return response.data;
  },

  importTrainingPrograms: async (
    file: File,
  ): Promise<import("@/components/modal/import-export/ImportTab").ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(
      "/training-programs/import",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
