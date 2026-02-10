import axiosInstance from './axiosInstance';
import { type Question, type QuestionCreateRequest } from '../types/question';

export const questionApi = {

    // ==================== GET ALL ====================
    getAll: async (): Promise<Question[]> => {
        const response = await axiosInstance.get<Question[]>(
            '/v1/questions'
        );
        return response.data;
    },

    // ==================== CREATE ====================
    create: async (
        data: QuestionCreateRequest
    ): Promise<Question> => {
        // Transform data to match backend expectations
        const payload = {
            questionCategoryId: data.categoryId,
            questionType: data.questionType,
            content: data.content,
            isActive: data.isActive,
            options: data.options.map(opt => ({
                content: opt.content,
                correct: opt.isCorrect,
                orderIndex: opt.orderIndex
            }))
        };

        const response = await axiosInstance.post<Question>(
            '/v1/questions',
            payload
        );
        return response.data;
    },

    // ==================== DELETE ====================
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/v1/questions/${id}`);
    }
};
