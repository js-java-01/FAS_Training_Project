import axiosInstance from './axiosInstance';

export type CohortStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface Cohort {
  id: string;
  code: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  status?: CohortStatus;
  courseId?: string;
  courseName?: string;
}

export interface CreateCohortRequest {
  code: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  status?: CohortStatus;
  courseId: string;
}

export type UpdateCohortRequest = Omit<Partial<CreateCohortRequest>, 'courseId'>;

export const cohortApi = {
  getByCourseId: async (courseId: string): Promise<Cohort[]> => {
    const response = await axiosInstance.get(`/cohorts/course/${courseId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Cohort> => {
    const response = await axiosInstance.get(`/cohorts/${id}`);
    return response.data;
  },

  create: async (payload: CreateCohortRequest): Promise<Cohort> => {
    const response = await axiosInstance.post('/cohorts', payload);
    return response.data;
  },

  update: async (id: string, payload: UpdateCohortRequest): Promise<Cohort> => {
    const response = await axiosInstance.put(`/cohorts/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cohorts/${id}`);
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/cohorts/template', { responseType: 'blob' });
    return response.data;
  },

  importCohorts: async (courseId: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    await axiosInstance.post('/cohorts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  exportCohorts: async (courseId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/cohorts/export?courseId=${courseId}`, { responseType: 'blob' });
    return response.data;
  },
};
