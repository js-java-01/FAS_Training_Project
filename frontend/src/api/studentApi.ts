import axiosInstance from './axiosInstance';
import type { Student, CreateStudentRequest, UpdateStudentRequest } from '../types/student';

export const studentApi = {
  getAllStudents: async (): Promise<Student[]> => {
    const response = await axiosInstance.get<Student[]>('/students');
    return response.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await axiosInstance.get<Student>(`/students/${id}`);
    return response.data;
  },

  getStudentByStudentId: async (studentId: string): Promise<Student> => {
    const response = await axiosInstance.get<Student>(`/students/student-id/${studentId}`);
    return response.data;
  },

  createStudent: async (student: CreateStudentRequest): Promise<Student> => {
    const response = await axiosInstance.post<Student>('/students', student);
    return response.data;
  },

  updateStudent: async (id: string, student: UpdateStudentRequest): Promise<Student> => {
    const response = await axiosInstance.put<Student>(`/students/${id}`, student);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/students/${id}`);
  },
};
