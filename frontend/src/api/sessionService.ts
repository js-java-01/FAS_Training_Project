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
};
