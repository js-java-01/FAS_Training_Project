import axiosInstance from './axiosInstance';
import type { Course } from '../types/course';

export type EnrollmentOnlineStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export interface EnrollmentOnlineResponse {
  id: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentOnlineStatus;
}

export interface EnrolledOnlineCourse {
  courseId: string;
  course: Course;
}

export const enrollmentOnlineApi = {
  /**
   * Enroll the current logged-in user into an online course.
   */
  enroll: async (courseId: string): Promise<EnrollmentOnlineResponse> => {
    const response = await axiosInstance.post<EnrollmentOnlineResponse>('/online-enrollments', { courseId });
    return response.data;
  },

  /**
   * Get all online courses the current user is enrolled in.
   */
  getMyEnrolledCourses: async (): Promise<EnrolledOnlineCourse[]> => {
    const response = await axiosInstance.get<EnrolledOnlineCourse[]>('/online-enrollments/my-courses');
    return response.data;
  },
};
