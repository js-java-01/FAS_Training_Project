import axiosInstance from './axiosInstance';
import {
    type AssessmentQuestion,
    type AssessmentQuestionCreateRequest,
    type AssessmentQuestionUpdateRequest
} from '../types/assessmentQuestion';

export const assessmentQuestionApi = {

    // ==================== GET ALL ====================
    getAll: async (): Promise<AssessmentQuestion[]> => {
        const response = await axiosInstance.get<AssessmentQuestion[]>(
            '/v1/assessment-questions'
        );
        return response.data;
    },

    // ==================== GET BY ID ====================
    getById: async (id: string): Promise<AssessmentQuestion> => {
        const response = await axiosInstance.get<AssessmentQuestion>(
            `/v1/assessment-questions/${id}`
        );
        return response.data;
    },

    // ==================== GET BY ASSESSMENT ID ====================
    getByAssessmentId: async (assessmentId: number): Promise<AssessmentQuestion[]> => {
        const response = await axiosInstance.get<AssessmentQuestion[]>(
            `/v1/assessment-questions/assessment/${assessmentId}`
        );
        return response.data;
    },

    // ==================== CREATE ====================
    create: async (
        data: AssessmentQuestionCreateRequest
    ): Promise<AssessmentQuestion> => {
        console.log('CREATE Assessment Question - Payload:', JSON.stringify(data, null, 2));
        try {
            const response = await axiosInstance.post<AssessmentQuestion>(
                '/v1/assessment-questions',
                data
            );
            return response.data;
        } catch (error: any) {
            console.error('CREATE Assessment Question - Error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    // ==================== UPDATE ====================
    update: async (
        id: string,
        data: AssessmentQuestionUpdateRequest
    ): Promise<AssessmentQuestion> => {
        const response = await axiosInstance.put<AssessmentQuestion>(
            `/v1/assessment-questions/${id}`,
            data
        );
        return response.data;
    },

    // ==================== DELETE ====================
    delete: async (id: string): Promise<void> => {
        await axiosInstance.delete(`/v1/assessment-questions/${id}`);
    },

    // ==================== BULK CREATE ====================
    bulkCreate: async (
        data: AssessmentQuestionCreateRequest[]
    ): Promise<AssessmentQuestion[]> => {
        const response = await axiosInstance.post<AssessmentQuestion[]>(
            '/v1/assessment-questions/bulk',
            data
        );
        return response.data;
    },

    // ==================== REORDER ====================
    reorder: async (
        assessmentId: number,
        questionOrders: { id: string; orderIndex: number }[]
    ): Promise<void> => {
        await axiosInstance.put(
            `/v1/assessment-questions/assessment/${assessmentId}/reorder`,
            questionOrders
        );
    }
};
