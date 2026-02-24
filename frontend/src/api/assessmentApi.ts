import axiosInstance from './axiosInstance';
import {
  type Assessment,
  type AssessmentCreateRequest,
  type AssessmentUpdateRequest,
  type AssessmentSearchParams
} from '../types/assessment';
import { type PaginatedResponse } from '../types/assessmentType';

export const assessmentApi = {

  // ==================== GET LIST ====================
  getAll: async (
    params?: AssessmentSearchParams
  ): Promise<PaginatedResponse<Assessment>> => {
    const response = await axiosInstance.get<
      PaginatedResponse<Assessment>
    >('/assessment', { params });

    return response.data;
  },

  // ==================== GET BY ID ====================
  getById: async (id: number): Promise<Assessment> => {
    const response = await axiosInstance.get<Assessment>(
      `/assessment/${id}`
    );
    return response.data;
  },

  // ==================== CREATE ====================
  create: async (
    data: AssessmentCreateRequest
  ): Promise<Assessment> => {
    const response = await axiosInstance.post<Assessment>(
      '/assessment',
      data
    );
    return response.data;
  },

  // ==================== UPDATE ====================
  update: async (
    id: number,
    data: AssessmentUpdateRequest
  ): Promise<Assessment> => {
    const response = await axiosInstance.put<Assessment>(
      `/assessment/${id}`,
      data
    );
    return response.data;
  },

  // ==================== DELETE ====================
  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/assessment/${id}`);
  }
};
