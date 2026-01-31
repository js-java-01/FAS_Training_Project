import axiosInstance from './axiosInstance';
import { type AssessmentType, type AssessmentTypeRequest } from '../types/assessmentType';

export const assessmentTypeApi = {
  getAll: async (): Promise<AssessmentType[]> => {
    const response = await axiosInstance.get<AssessmentType[]>('/assessments');
    return response.data;
  },

  getById: async (id: string): Promise<AssessmentType> => {
    const response = await axiosInstance.get<AssessmentType>(`/assessments/${id}`);
    return response.data;
  },

  create: async (
    data: AssessmentTypeRequest
  ): Promise<AssessmentType> => {
    const response = await axiosInstance.post<AssessmentType>(
      '/assessments',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: AssessmentTypeRequest
  ): Promise<AssessmentType> => {
    const response = await axiosInstance.put<AssessmentType>(
      `/assessments/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/assessments/${id}`);
  },

  searchByName: async (name: string): Promise<AssessmentType[]> => {
    const response = await axiosInstance.get<AssessmentType[]>(
      '/assessments/search/name',
      {
        params: { name },
      }
    );
    return response.data;
  },

  importAssessments: async (file: File): Promise<AssessmentType[]> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<AssessmentType[]>(
      '/assessments/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  exportAssessments: async (): Promise<void> => {
    const response = await axiosInstance.get('/assessments/export', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessments.xlsx';
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  },


};

