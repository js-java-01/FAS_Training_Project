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
};
