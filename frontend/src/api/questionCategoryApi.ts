import axiosInstance from './axiosInstance';
import {
  type QuestionCategory,
  type QuestionCategoryRequest
} from '../types/questionCategory';
import { type QuestionTag } from '../types/questionTag';

export const questionCategoryApi = {

  // ==================== GET ALL ====================
  getAll: async (): Promise<QuestionCategory[]> => {
    const response = await axiosInstance.get<QuestionCategory[]>(
      '/v1/question-categories'
    );
    return response.data;
  },

  // ==================== GET BY ID ====================
  getById: async (id: string): Promise<QuestionCategory> => {
    const response = await axiosInstance.get<QuestionCategory>(
      `/v1/question-categories/${id}`
    );
    return response.data;
  },

  // ==================== GET TAGS BY CATEGORY ID ====================
  getTags: async (categoryId: string): Promise<QuestionTag[]> => {
    const response = await axiosInstance.get<QuestionTag[]>(
      `/v1/question-categories/${categoryId}/tags`
    );
    return response.data;
  },

  // ==================== CREATE ====================
  create: async (
    data: QuestionCategoryRequest
  ): Promise<QuestionCategory> => {
    const response = await axiosInstance.post<QuestionCategory>(
      '/v1/question-categories',
      data
    );
    return response.data;
  },

  // ==================== UPDATE ====================
  update: async (
    id: string,
    data: QuestionCategoryRequest
  ): Promise<QuestionCategory> => {
    const response = await axiosInstance.put<QuestionCategory>(
      `/v1/question-categories/${id}`,
      data
    );
    return response.data;
  },

  // ==================== DELETE ====================
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/question-categories/${id}`);
  }
};
