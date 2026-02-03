import axiosInstance from './axiosInstance';
import { type PaginatedResponse } from '../types/assessmentType'; // bạn đang dùng chung type này
import type { Student, StudentRequest } from '@/types/student';


export const studentApi = {
    /**
     * Get students with filters + pagination
     */
    getAll: async (params?: {
        page?: number;
        size?: number;
        sort?: string; // ví dụ: "name,asc"

        searchContent?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHERS';
        minGpa?: number;
        maxGpa?: number;
        dobFrom?: string; // yyyy-MM-dd
        dobTo?: string;   // yyyy-MM-dd
    }): Promise<PaginatedResponse<Student>> => {
        const response = await axiosInstance.get<PaginatedResponse<Student>>(
            '/v1/students',
            {
                params: {
                    searchContent: params?.searchContent,
                    gender: params?.gender,
                    minGpa: params?.minGpa,
                    maxGpa: params?.maxGpa,
                    dobFrom: params?.dobFrom,
                    dobTo: params?.dobTo,
                    page: params?.page,
                    size: params?.size,
                    sort: params?.sort,
                },
            }
        );

        return response.data;
    },

    /**
     * Get student by id
     */
    getById: async (id: string): Promise<Student> => {
        const response = await axiosInstance.get<Student>(`/v1/students/${id}`);
        return response.data;
    },

    /**
     * Create student
     */
    create: async (data: StudentRequest): Promise<Student> => {
        const response = await axiosInstance.post<Student>(
            '/v1/students',
            data
        );
        return response.data;
    },

    /**
     * Update student
     */
    update: async (id: string, data: StudentRequest): Promise<Student> => {
        const response = await axiosInstance.put<Student>(
            `/v1/students/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete student
     */
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/v1/students/${id}`);
    },
};
