import axiosInstance from './axiosInstance';
import {
    type Question,
    type QuestionCreateRequest,
    type PagedQuestionResponse,
    type QuestionListItem
} from '../types/question';

export const questionApi = {

    // ==================== GET ALL (Paginated) ====================
    getAll: async (params?: {
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<PagedQuestionResponse> => {
        const response = await axiosInstance.get<PagedQuestionResponse>(
            '/v1/questions',
            { params }
        );
        return response.data;
    },

    // ==================== GET ALL CONTENT (Non-paginated) ====================
    getAllContent: async (): Promise<QuestionListItem[]> => {
        const response = await axiosInstance.get<PagedQuestionResponse>(
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
            options: data.options,
            ...(data.tagIds && { tagIds: data.tagIds })
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
            options: data.options,
            ...(data.tagIds && { tagIds: data.tagIds })
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
