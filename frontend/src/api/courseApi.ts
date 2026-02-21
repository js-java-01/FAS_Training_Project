import axiosInstance from './axiosInstance';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '../types/course';

export type CourseFilterParams = {
  keyword?: string;
  topicCode?: string;
  trainerId?: string;
  status?: string;
};

export const courseApi = {
  getCourses: async (page = 0, size = 10, filters?: CourseFilterParams) => {
    const q = new URLSearchParams({ page: String(page), size: String(size) });
    if (filters?.keyword) q.set('keyword', filters.keyword);
    if (filters?.topicCode) q.set('topicCode', filters.topicCode);
    if (filters?.trainerId) q.set('trainerId', filters.trainerId);
    if (filters?.status) q.set('status', filters.status);
    const response = await axiosInstance.get(`/courses?${q.toString()}`);
    return response.data; // Spring Page<Course>
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
};
