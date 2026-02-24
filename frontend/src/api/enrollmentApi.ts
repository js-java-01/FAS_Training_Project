import axiosInstance from './axiosInstance';

export type EnrollmentStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export interface EnrollmentResponse {
  id: string;
  cohortId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
}

export const enrollmentApi = {
  /**
   * Enroll the current logged-in user into a cohort.
   * Requires ENROLL_COURSE permission.
   */
  enroll: async (cohortId: string): Promise<EnrollmentResponse> => {
    const response = await axiosInstance.post<EnrollmentResponse>('/enrollments', { cohortId });
    return response.data;
  },
};
