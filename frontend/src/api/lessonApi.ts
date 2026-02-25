import axiosInstance from './axiosInstance';

export interface Lesson {
  id: string;
  lessonName: string;
  description?: string;
  courseId: string;
}

export interface CreateLessonRequest {
  lessonName: string;
  description?: string;
  courseId: string; 
}

export type UpdateLessonRequest = Partial<Omit<CreateLessonRequest, 'courseId'>>;

export const lessonApi = {
  getByCourseId: async (courseId: string): Promise<Lesson[]> => {
    const response = await axiosInstance.get(`/lessons/course/${courseId}`);
    return response.data;
  },

  create: async (payload: CreateLessonRequest): Promise<Lesson> => {
    const response = await axiosInstance.post('/lessons', payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateLessonRequest): Promise<Lesson> => {
    const response = await axiosInstance.put(`/lessons/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/lessons/${id}`);
  },
};