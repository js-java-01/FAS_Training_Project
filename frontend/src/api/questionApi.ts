import axiosInstance from './axiosInstance';
import { type Question, type QuestionCreateRequest } from '../types/question';

export const questionApi = {

    // ==================== GET ALL ====================
    getAll: async (): Promise<Question[]> => {
        const response = await axiosInstance.get<{ content: Question[] }>(
            '/v1/questions'
        );
        return response.data.content || [];
    },

    // ==================== CREATE ====================
    create: async (
        data: QuestionCreateRequest
    ): Promise<Question> => {
        const payload = {
            questionCategoryId: data.categoryId,
            questionType: data.questionType,
            content: data.content,
            isActive: data.isActive,
            options: data.options
        };

        const response = await axiosInstance.post<Question>(
            '/v1/questions',
            payload
        );
        return response.data;
    },

    // ==================== UPDATE ====================
    update: async (
        id: string,
        data: QuestionCreateRequest
    ): Promise<Question> => {
        const payload = {
            questionCategoryId: data.categoryId,
            questionType: data.questionType,
            content: data.content,
            isActive: data.isActive,
            options: data.options
        };

        const response = await axiosInstance.put<Question>(
            `/v1/questions/${id}`,
            payload
        );
        return response.data;
    },

    // ==================== GET BY ID ====================
    getById: async (id: string): Promise<Question> => {
        const response = await axiosInstance.get<Question>(
            `/v1/questions/${id}`
        );
        return response.data;
    },

    // ==================== DELETE ====================
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/v1/questions/${id}`);
    }
};
