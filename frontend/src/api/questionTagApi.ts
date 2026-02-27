import axiosInstance from './axiosInstance';
import {
    type QuestionTag,
    type QuestionTagRequest,
    type PagedQuestionTagResponse
} from '../types/questionTag';

export const questionTagApi = {

    // ==================== GET ALL (Paginated) ====================
    getAll: async (params?: {
        page?: number;
        size?: number;
        sort?: string;
    }): Promise<PagedQuestionTagResponse> => {
        const response = await axiosInstance.get<PagedQuestionTagResponse>(
            '/v1/tags',
            { params }
        );
        return response.data;
    },

    // ==================== GET BY ID ====================
    getById: async (id: number): Promise<QuestionTag> => {
        const response = await axiosInstance.get<QuestionTag>(
            `/v1/tags/${id}`
        );
        return response.data;
    },

    // ==================== CREATE ====================
    create: async (
        data: QuestionTagRequest
    ): Promise<QuestionTag> => {
        const response = await axiosInstance.post<QuestionTag>(
            '/v1/tags',
            data
        );
        return response.data;
    },

    // ==================== UPDATE ====================
    update: async (
        id: number,
        data: QuestionTagRequest
    ): Promise<QuestionTag> => {
        const response = await axiosInstance.patch<QuestionTag>(
            `/v1/tags/${id}`,
            data
        );
        return response.data;
    },

    // ==================== DELETE ====================
    delete: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/v1/tags/${id}`);
    }
};
