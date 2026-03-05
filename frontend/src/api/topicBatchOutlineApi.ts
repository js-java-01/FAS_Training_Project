import axiosInstance from "./axiosInstance";
import type { ImportResult } from "@/components/modal/import-export/ImportTab";

export interface TopicSessionBatchItem {
  deliveryType: string;
  content?: string;
  note?: string;
  duration?: number;
  sessionOrder?: number;
}

export interface TopicLessonBatchItem {
  lessonName: string;
  description?: string;
  sessions?: TopicSessionBatchItem[];
}

export interface TopicAiPreviewSessionResponse {
  order?: number;
  deliveryType?: string;
  content?: string;
  note?: string;
  duration?: number;
}

export interface TopicAiPreviewLessonResponse {
  name: string;
  description?: string;
  sessions?: TopicAiPreviewSessionResponse[];
}

export interface TopicApplyAiPreviewRequest {
  lessons: TopicAiPreviewLessonResponse[];
}

export const topicBatchOutlineApi = {
  createBatch: async (
    topicId: string,
    lessons: TopicLessonBatchItem[],
  ): Promise<void> => {
    await axiosInstance.post(`/topics/${topicId}/batch-outline/batch`, {
      topicId,
      lessons,
    });
  },

  exportOutline: async (topicId: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/topics/${topicId}/batch-outline/export`,
      { responseType: "blob" },
    );
    return response.data;
  },

  downloadTemplate: async (topicId: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/topics/${topicId}/batch-outline/template`,
      { responseType: "blob" },
    );
    return response.data;
  },

  importOutline: async (topicId: string, file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post(
      `/topics/${topicId}/batch-outline/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  generateAiPreview: async (
    topicId: string,
  ): Promise<TopicAiPreviewLessonResponse[]> => {
    const response = await axiosInstance.post(
      `/topics/${topicId}/batch-outline/ai-preview`,
    );
    return response.data;
  },

  applyAiPreview: async (
    topicId: string,
    request: TopicApplyAiPreviewRequest,
  ): Promise<void> => {
    await axiosInstance.post(
      `/topics/${topicId}/batch-outline/apply-ai-preview`,
      request,
    );
  },
};

