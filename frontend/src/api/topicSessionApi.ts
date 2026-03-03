import axiosInstance from "./axiosInstance";
import type { TopicSessionRequest, TopicSessionResponse } from "@/types/topicSession";

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
};
