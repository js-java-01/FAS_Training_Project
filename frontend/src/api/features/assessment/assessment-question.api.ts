import type {
  AssessmentQuestion,
  AssessmentQuestionCreateRequest,
  AssessmentQuestionUpdateRequest,
} from "@/types/features/assessment/assessment-question";
import axiosInstance from "../../axiosInstance";
import { Url } from "@/api/url";
import { createBaseApiService } from "@/api/base-service.api";

const base = createBaseApiService<
  AssessmentQuestion,
  null,
  AssessmentQuestionCreateRequest,
  AssessmentQuestionUpdateRequest
>(axiosInstance, Url.ASSESSMENT_QUESTION);

export const assessmentQuestionApi = Object.assign({}, base, {
  getByAssessmentId: async (assessmentId: number): Promise<AssessmentQuestion[]> => {
    try {
      const response = await axiosInstance.get<AssessmentQuestion[]>(
        `${Url.ASSESSMENT_QUESTION}/assessment/${assessmentId}`,
        {
          responseType: 'json',
          transformResponse: [(data) => {
            if (typeof data === 'object') return data;

            if (typeof data === 'string') {
              try {
                return JSON.parse(data);
              } catch (e) {
                console.error("Failed to parse assessment questions response as JSON:", e);
                return [];
              }
            }

            return data || [];
          }],
        }
      );

      // Handle different response formats from backend
      let data: AssessmentQuestion[] = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (typeof response.data === 'string') {
        console.error("Backend returned STRING instead of array for assessment questions");
        return [];
      } else if (response.data && typeof response.data === 'object') {
        // Check for common pagination wrappers
        if ('content' in response.data) {
          data = (response.data as any).content || [];
        } else if ('items' in response.data) {
          data = (response.data as any).items || [];
        } else if ('data' in response.data) {
          data = (response.data as any).data || [];
        }
      }

      return data;
    } catch (error: any) {
      console.error("Error fetching assessment questions:", error?.message);
      throw error;
    }
  },

  bulkCreate: async (
    data: AssessmentQuestionCreateRequest[],
  ): Promise<AssessmentQuestion[]> => {
    const response = await axiosInstance.post<AssessmentQuestion[]>(
      `${Url.ASSESSMENT_QUESTION}/bulk`,
      data,
    );
    return response.data;
  },

  reorder: async (
    assessmentId: number,
    questionOrders: { id: string; orderIndex: number }[],
  ): Promise<void> => {
    await axiosInstance.put(
      `${Url.ASSESSMENT_QUESTION}/assessment/${assessmentId}/reorder`,
      questionOrders,
    );
  },
});
