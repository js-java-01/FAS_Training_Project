import axiosInstance from '../../axiosInstance';
import type {
  UserAssessment,
  Submission,
  SubmissionResult,
  StartSubmissionRequest,
  SubmitAnswerRequest,
  SubmitSubmissionRequest,
  PaginatedResponse,
} from '../../../types/exam';

export const examApi = {

  // ==================== GET USER ASSESSMENTS ====================
  getUserAssessments: async (): Promise<UserAssessment[]> => {
    const response = await axiosInstance.get<UserAssessment[]>(
      '/assessment/user/me'
    );
    return response.data;
  },

  // ==================== START SUBMISSION ====================
  startSubmission: async (
    data: StartSubmissionRequest
  ): Promise<Submission> => {
    const response = await axiosInstance.post<Submission>(
      '/submissions',
      data
    );
    return response.data;
  },

  // ==================== SUBMIT ANSWER (auto-save) ====================
  submitAnswer: async (
    submissionId: string,
    data: SubmitAnswerRequest
  ): Promise<Submission> => {
    const response = await axiosInstance.post<Submission>(
      `/submissions/${submissionId}/answers`,
      data
    );
    return response.data;
  },

  // ==================== SUBMIT SUBMISSION (finish) ====================
  submitSubmission: async (
    submissionId: string,
    data: SubmitSubmissionRequest
  ): Promise<SubmissionResult> => {
    const response = await axiosInstance.post<SubmissionResult>(
      `/submissions/${submissionId}/submit`,
      data
    );
    return response.data;
  },

  // ==================== GET SUBMISSION BY ID ====================
  getSubmissionById: async (submissionId: string): Promise<Submission> => {
    const response = await axiosInstance.get<Submission>(
      `/submissions/${submissionId}`
    );
    return response.data;
  },

  // ==================== SEARCH SUBMISSIONS (paged, current user) ====================
  searchSubmissions: async (
    assessmentId?: number,
    page?: number,
    size?: number
  ): Promise<PaginatedResponse<Submission>> => {
    const response = await axiosInstance.get<PaginatedResponse<Submission>>(
      '/submissions',
      {
        params: {
          assessmentId,
          page,
          size,
          sort: 'startedAt,desc',
        },
      }
    );
    return response.data;
  },
};
