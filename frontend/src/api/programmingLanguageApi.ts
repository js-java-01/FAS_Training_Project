import axiosInstance from './axiosInstance';
import { type ProgrammingLanguage, type ProgrammingLanguageRequest } from '../types/programmingLanguage';

export const programmingLanguageApi = {
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }): Promise<{
    content: ProgrammingLanguage[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> => {
    const response = await axiosInstance.get('/programming-languages', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ProgrammingLanguage> => {
    const response = await axiosInstance.get<ProgrammingLanguage>(`/programming-languages/${id}`);
    return response.data;
  },

  create: async (
    data: ProgrammingLanguageRequest
  ): Promise<ProgrammingLanguage> => {
    const response = await axiosInstance.post<ProgrammingLanguage>(
      '/programming-languages',
      data
    );
    return response.data;
  },

  update: async (
    id: number,
    data: ProgrammingLanguageRequest
  ): Promise<ProgrammingLanguage> => {
    const response = await axiosInstance.put<ProgrammingLanguage>(
      `/programming-languages/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/programming-languages/${id}`);
  },

  searchByName: async (name: string): Promise<ProgrammingLanguage[]> => {
    const response = await axiosInstance.get<ProgrammingLanguage[]>(
      '/programming-languages/search/name',
      {
        params: { name },
      }
    );
    return response.data;
  },

  export: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/programming-languages/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  import: async (file: File): Promise<{
    successCount: number;
    failureCount: number;
    errors?: { row: number; message: string }[];
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/programming-languages/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/programming-languages/import-template', {
      responseType: 'blob'
    });
    return response.data;
  }
};