import axiosInstance from "./axiosInstance";

export interface SessionBatchItem {
  type?: string;
  topic?: string;
  studentTasks?: string;
  sessionOrder?: number;
}

export interface LessonBatchItem {
  lessonName: string;
  description?: string;
  order?: number;
  sessions?: SessionBatchItem[];
}

export interface BatchCreateRequest {
  courseId: string;
  lessons: LessonBatchItem[];
}

export interface AiPreviewSessionResponse {
  order?: number;
  type?: string;
  topic?: string;
  studentTask?: string;
}

export interface AiPreviewLessonResponse {
  name: string;
  description?: string;
  sessions?: AiPreviewSessionResponse[];
}

export interface ApplyAiPreviewRequest {
  lessons: AiPreviewLessonResponse[];
}

export const batchOutlineApi = {
  createBatch: async (request: BatchCreateRequest): Promise<void> => {
    await axiosInstance.post("/batch-outline", request);
  },

  exportOutline: async (courseId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/batch-outline/export/${courseId}`, {
      responseType: "blob",
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get("/batch-outline/template", {
      responseType: "blob",
    });
    return response.data;
  },

  importOutline: async (courseId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    await axiosInstance.post(`/batch-outline/import/${courseId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  generateAiPreview: async (courseId: string): Promise<AiPreviewLessonResponse[]> => {
    const response = await axiosInstance.post(`/batch-outline/${courseId}/outline/ai-preview`);
    return response.data;
  },

  applyAiPreview: async (courseId: string, request: ApplyAiPreviewRequest): Promise<void> => {
    await axiosInstance.post(`/batch-outline/${courseId}/outline/apply-ai-preview`, request);
  },
};
