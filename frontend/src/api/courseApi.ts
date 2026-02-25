import axiosInstance from './axiosInstance';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '../types/course';

export interface CoursePageResponse {
  items: Course[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export const courseApi = {
  getCourses: async (params: {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
    status?: string;
    trainerId?: string;
  } = {}): Promise<CoursePageResponse> => {
    const { page = 0, size = 10, sort, keyword, status, trainerId } = params;
    const response = await axiosInstance.get<{
      content: Course[];
      number: number;
      size: number;
      totalPages: number;
      totalElements: number;
    }>('/courses', {
      params: {
        page,
        size,
        ...(sort ? { sort } : {}),
        ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
        ...(status ? { status } : {}),
        ...(trainerId ? { trainerId } : {}),
      },
    });
    const d = response.data;
    return {
      items: d.content,
      pagination: {
        page: d.number,
        pageSize: d.size,
        totalPages: d.totalPages,
        totalElements: d.totalElements,
      },
    };
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await axiosInstance.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (payload: CreateCourseRequest): Promise<Course> => {
    const response = await axiosInstance.post('/courses', payload);
    return response.data;
  },

  updateCourse: async (id: string, payload: UpdateCourseRequest): Promise<Course> => {
    const response = await axiosInstance.put(`/courses/${id}`, payload);
    return response.data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/courses/${id}`);
  },

  exportCourses: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/courses/export', { responseType: 'blob' });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/courses/template', { responseType: 'blob' });
    return response.data;
  },

  importCourses: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await axiosInstance.post('/courses/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
