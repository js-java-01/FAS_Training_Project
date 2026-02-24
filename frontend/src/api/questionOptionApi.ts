import axiosInstance from './axiosInstance';
import {
  type QuestionOption,
  type QuestionOptionRequest
} from '../types/questionOption';

export const questionOptionApi = {

  // ==================== GET ALL ====================
  getAll: async (): Promise<QuestionOption[]> => {
    const response = await axiosInstance.get<QuestionOption[]>(
      '/v1/question-options'
    );
    return response.data;
  },

  // ==================== CREATE ====================
  create: async (
    data: QuestionOptionRequest
  ): Promise<QuestionOption> => {
    const response = await axiosInstance.post<QuestionOption>(
      '/v1/question-options',
      data
    );
    return response.data;
  },

  // ==================== UPDATE ====================
  update: async (
    id: string,
    data: QuestionOptionRequest
  ): Promise<QuestionOption> => {
    const response = await axiosInstance.put<QuestionOption>(
      `/v1/question-options/${id}`,
      data
    );
    return response.data;
  },

  // ==================== DELETE ====================
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/question-options/${id}`);
  }
};
