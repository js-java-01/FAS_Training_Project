import axiosInstance from "./axiosInstance";
import type { SessionRequest, SessionResponse } from "@/types/session";

export const sessionService = {
  createSession: async (data: SessionRequest): Promise<SessionResponse> => {
    const res = await axiosInstance.post<SessionResponse>("/sessions", data);
    return res.data;
  },

  updateSession: async (id: string, data: SessionRequest): Promise<SessionResponse> => {
    const res = await axiosInstance.put<SessionResponse>(`/sessions/${id}`, data);
    return res.data;
  },

  deleteSession: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/sessions/${id}`);
  },

  getSessionsByLesson: async (lessonId: string): Promise<SessionResponse[]> => {
    const res = await axiosInstance.get<SessionResponse[]>(`/sessions/lesson/${lessonId}`);
    return res.data;
  },

  exportSessions: async (lessonId: string): Promise<Blob> => {
    const res = await axiosInstance.get(`/sessions/export/lesson/${lessonId}`, {
      responseType: "blob",
    });
    return res.data;
  },

  downloadSessionTemplate: async (): Promise<Blob> => {
    const res = await axiosInstance.get("/sessions/template", {
      responseType: "blob",
    });
    return res.data;
  },

  importSessions: async (lessonId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    await axiosInstance.post(`/sessions/import/lesson/${lessonId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
