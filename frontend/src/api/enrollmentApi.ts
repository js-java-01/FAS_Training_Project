import axiosInstance from './axiosInstance';
import type { Course } from '../types/course';

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

  /**
   * Get all courses the current user is enrolled in.
   * Requires COURSE_READ permission.
   */
  getMyEnrolledCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<Course[]>('/enrollments/my-courses');
    return response.data;
  },
};
