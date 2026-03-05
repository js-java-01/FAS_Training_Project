import axiosInstance from "./axiosInstance";
import type { TopicSessionRequest, TopicSessionResponse } from "@/types/topicSession";
import type { ImportResult } from "@/components/modal/import-export/ImportTab";

export const topicSessionApi = {
  createSession: async (payload: TopicSessionRequest): Promise<TopicSessionResponse> => {
    const res = await axiosInstance.post<TopicSessionResponse>("/topics/sessions", payload);
    return res.data;
  },

  updateSession: async (sessionId: string, payload: TopicSessionRequest): Promise<TopicSessionResponse> => {
    const res = await axiosInstance.put<TopicSessionResponse>(`/topics/sessions/${sessionId}`, payload);
    return res.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await axiosInstance.delete(`/topics/sessions/${sessionId}`);
  },

  getSessionById: async (sessionId: string): Promise<TopicSessionResponse> => {
    const res = await axiosInstance.get<TopicSessionResponse>(`/topics/sessions/${sessionId}`);
    return res.data;
  },

  getSessionsByLesson: async (lessonId: string): Promise<TopicSessionResponse[]> => {
    const res = await axiosInstance.get<TopicSessionResponse[]>(`/topics/sessions/lesson/${lessonId}`);
    return res.data;
  },

  exportSessions: async (lessonId: string): Promise<Blob> => {
    const res = await axiosInstance.get(`/topics/sessions/export/lesson/${lessonId}`, {
      responseType: "blob",
    });
    return res.data;
  },

  downloadSessionTemplate: async (): Promise<Blob> => {
    const res = await axiosInstance.get("/topics/sessions/template", {
      responseType: "blob",
    });
    return res.data;
  },

  importSessions: async (lessonId: string, file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<ImportResult>(
      `/topics/sessions/import/lesson/${lessonId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
