import { createBaseApiService } from "@/api/base-service.api";
import type {
  AssessmentQuestion,
  AssessmentQuestionCreateRequest
} from "@/types/features/assessment/assessment-question";
import axiosInstance from "../../axiosInstance";

const path = "/assessment-questions";

const base = createBaseApiService<AssessmentQuestion, null>({ path });

export const assessmentQuestionApi = Object.assign({}, base, {
  create: async (data: AssessmentQuestionCreateRequest): Promise<AssessmentQuestion> => {
    const response = await axiosInstance.post<AssessmentQuestion>(path, data);
    return response.data;
  },

  getByAssessmentId: async (assessmentId: string): Promise<AssessmentQuestion[]> => {
    const response = await axiosInstance.get<AssessmentQuestion[]>(
      `${path}/assessment/${assessmentId}`
    );
    return response.data;
  },

  bulkCreate: async (
    data: AssessmentQuestionCreateRequest[],
  ): Promise<AssessmentQuestion[]> => {
    const response = await axiosInstance.post<AssessmentQuestion[]>(
      `${path}/bulk`,
      data,
    );
    return response.data;
  },

  reorder: async (
    assessmentId: string,
    questionOrders: { id: string; orderIndex: number }[],
  ): Promise<void> => {
    await axiosInstance.put(
      `${path}/${assessmentId}/reorder`,
      questionOrders,
    );
  },
});