import axiosInstance from "./axiosInstance";

export interface TopicAssessmentTypeWeightItem {
  id: string;
  assessmentTypeId?: string;
  accessmentTypeName: string;
  assessmentTypeDescription?: string;
  weight: number;
}

export interface TopicAssessmentTypeWeightPayload {
  topicId: string;
  assessmentTypeId: string;
  weight: number;
}

export const topicAssessmentTypeWeightApi = {
  getByTopicId: async (topicId: string): Promise<TopicAssessmentTypeWeightItem[]> => {
    const response = await axiosInstance.get<TopicAssessmentTypeWeightItem[]>(
      `/topic-accessment-weights/${topicId}`,
      { params: { topicId } },
    );
    return response.data;
  },

  createByTopicId: async (
    topicId: string,
    payload: TopicAssessmentTypeWeightPayload[],
  ): Promise<TopicAssessmentTypeWeightItem[]> => {
    const response = await axiosInstance.post<TopicAssessmentTypeWeightItem[]>(
      `/topic-accessment-weights/${topicId}`,
      payload,
      { params: { topicId } },
    );
    return response.data;
  },

  updateByTopicId: async (
    topicId: string,
    payload: TopicAssessmentTypeWeightPayload[],
  ): Promise<TopicAssessmentTypeWeightItem[]> => {
    const response = await axiosInstance.put<TopicAssessmentTypeWeightItem[]>(
      `/topic-accessment-weights/${topicId}`,
      payload,
      { params: { topicId } },
    );
    return response.data;
  },

  deleteAllByTopicId: async (topicId: string): Promise<TopicAssessmentTypeWeightItem[]> => {
    const response = await axiosInstance.put<TopicAssessmentTypeWeightItem[]>(
      `/topic-accessment-weights/${topicId}`,
      [],
      { params: { topicId } },
    );
    return response.data;
  },
};
