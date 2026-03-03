import axiosInstance from "./axiosInstance";

export interface TopicSessionBatchItem {
  deliveryType: string;
  trainingFormat?: string | null;
  duration: number;
  learningObjectiveIds?: string[];
  content?: string | null;
  note?: string | null;
}

export interface TopicLessonBatchItem {
  lessonName: string;
  description?: string | null;
  sessions: TopicSessionBatchItem[];
}

export interface TopicBatchCreateRequest {
  topicId: string;
  lessons: TopicLessonBatchItem[];
}

export const topicBatchOutlineApi = {
  createBatch: async (request: TopicBatchCreateRequest): Promise<void> => {
    await axiosInstance.post("/topics/batch-outline", request);
  },
};
