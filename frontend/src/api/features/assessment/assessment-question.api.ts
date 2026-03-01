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
