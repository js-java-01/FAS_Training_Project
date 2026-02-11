import axiosInstance from './axiosInstance';
import { type Question, type QuestionCreateRequest } from '../types/question';

export const questionApi = {

    // ==================== GET ALL ====================
    getAll: async (): Promise<Question[]> => {
        const response = await axiosInstance.get<any>(
            '/v1/questions'
        );
        // Transform backend response to match frontend types
        const questions = response.data.content || [];
        return questions.map((question: any) => ({
            ...question,
            options: question.options?.map((opt: any) => ({
                id: opt.id,
                content: opt.content,
                isCorrect: opt.correct,
                orderIndex: opt.orderIndex
            })) || []
        }));
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

        const response = await axiosInstance.post<any>(
            '/v1/questions',
            payload
        );
        // Transform backend response to match frontend types
        return {
            ...response.data,
            options: response.data.options?.map((opt: any) => ({
                id: opt.id,
                content: opt.content,
                isCorrect: opt.correct,
                orderIndex: opt.orderIndex
            })) || []
        };
    },

    // ==================== UPDATE ====================
    update: async (
        id: string,
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

        const response = await axiosInstance.put<any>(
            `/v1/questions/${id}`,
            payload
        );
        // Transform backend response to match frontend types
        return {
            ...response.data,
            options: response.data.options?.map((opt: any) => ({
                id: opt.id,
                content: opt.content,
                isCorrect: opt.correct,
                orderIndex: opt.orderIndex
            })) || []
        };
    },

    // ==================== GET BY ID ====================
    getById: async (id: string): Promise<Question> => {
        const response = await axiosInstance.get<any>(
            `/v1/questions/${id}`
        );
        // Transform backend response to match frontend types
        return {
            ...response.data,
            options: response.data.options?.map((opt: any) => ({
                id: opt.id,
                content: opt.content,
                isCorrect: opt.correct,
                orderIndex: opt.orderIndex
            })) || []
        };
    },

    // ==================== DELETE ====================
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/v1/questions/${id}`);
    }
};
