import axiosInstance from './axiosInstance';
import type { Course } from '../types/course';
import type { EnrollmentImportResult } from '@/types/enrollment';

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
  importStudents: async (classCode: string, file: File): Promise<EnrollmentImportResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/enrollments/import/${classCode}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },

    });
    return response.data;
  },
  exportStudents: async (classCode: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/enrollments/export/${classCode}`, {
      responseType: "blob",
    });
    return response.data;
  },
  exportTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get(`/enrollments/export/template`, {
      responseType: "blob",
    });
    return response.data;
  },
};
