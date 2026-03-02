import axiosInstance from './axiosInstance';
import type { Course } from '../types/course';

export type EnrollmentStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export interface EnrollmentResponse {
  id: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
}

export interface EnrolledCourse {
  courseId: string;
  course: Course;
}

export const enrollmentApi = {
  /**
   * Enroll the current logged-in user into a course directly.
   * Requires ENROLL_COURSE permission.
   */
  enroll: async (enrollKey: string, classID: string): Promise<string> => {
    const response = await axiosInstance.post<string>('/enrollments', { enrollKey, classID });
    return response.data;
  },

  /**
   * Get all courses the current user is enrolled in.
   */
  getMyEnrolledCourses: async (): Promise<EnrolledCourse[]> => {
    const response = await axiosInstance.get<EnrolledCourse[]>('/enrollments/my-courses');
    return response.data;
  },
};
