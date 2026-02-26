import axiosInstance from './axiosInstance';
import { type AssessmentType, type AssessmentTypeRequest } from '../types/assessmentType';
import { type PaginatedResponse } from '../types/assessmentType';
import { type ExportRequest, type ExportPreviewResponse } from '../types/assessmentExport';

export const assessmentTypeApi = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    keyword?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<AssessmentType>> => {
    const response = await axiosInstance.get<PaginatedResponse<AssessmentType>>('/assessment-type', { params });
    return response.data;
  },

  getById: async (id: string): Promise<AssessmentType> => {
    const response = await axiosInstance.get<AssessmentType>(`/assessment-type/${id}`);
    return response.data;
  },

  create: async (
    data: AssessmentTypeRequest
  ): Promise<AssessmentType> => {
    const response = await axiosInstance.post<AssessmentType>(
      '/assessment-type',
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: AssessmentTypeRequest
  ): Promise<AssessmentType> => {
    const response = await axiosInstance.put<AssessmentType>(
      `/assessment-type/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/assessment-type/${id}`);
  },

  searchByName: async (name: string): Promise<AssessmentType[]> => {
    const response = await axiosInstance.get<AssessmentType[]>(
      '/assessment-type/search/name',
      {
        params: { name },
      }
    );
    return response.data;
  },

  importAssessment: async (file: File): Promise<{
    totalRows: number;
    successCount: number;
    errorCount: number;
    errors?: { row: number; message: string }[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/assessment-type/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  exportAssessment: async (): Promise<void> => {
    const response = await axiosInstance.get('/assessment-type/export', {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'assessment.xlsx';
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // New methods for Export Modal
  getExportPreview: async (request: ExportRequest): Promise<ExportPreviewResponse> => {
    const response = await axiosInstance.post<ExportPreviewResponse>('/assessment-type/export/preview', request);
    return response.data;
  },

  export: async (request: ExportRequest): Promise<Blob> => {
    const response = await axiosInstance.post('/assessment-type/export', request, {
      responseType: 'blob'
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/assessment-type/template', {
      responseType: 'blob'
    });
    return response.data;
  }
};
