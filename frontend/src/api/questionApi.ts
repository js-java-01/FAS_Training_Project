import axiosInstance from './axiosInstance';
import { type Question, type QuestionCreateRequest } from '../types/question';

export const questionApi = {

  // ==================== GET ALL ====================
  getAll: async (): Promise<Question[]> => {
    const response = await axiosInstance.get<Question[]>(
      '/api/v1/questions'
    );
    return response.data;
  },

  // ==================== CREATE ====================
  create: async (
    data: QuestionCreateRequest
  ): Promise<Question> => {
    const response = await axiosInstance.post<Question>(
      '/api/v1/questions',
      data
    );
    return response.data;
  },

  // ==================== DELETE ====================
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/v1/questions/${id}`);
  }
};
