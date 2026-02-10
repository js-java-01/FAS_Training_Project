import axiosInstance from './axiosInstance';
import {
  type QuestionCategory,
  type QuestionCategoryRequest
} from '../types/questionCategory';

export const questionCategoryApi = {

  // ==================== GET ALL ====================
  getAll: async (): Promise<QuestionCategory[]> => {
    const response = await axiosInstance.get<QuestionCategory[]>(
      '/api/v1/question-categories'
    );
    return response.data;
  },

  // ==================== CREATE ====================
  create: async (
    data: QuestionCategoryRequest
  ): Promise<QuestionCategory> => {
    const response = await axiosInstance.post<QuestionCategory>(
      '/api/v1/question-categories',
      data
    );
    return response.data;
  }
};
