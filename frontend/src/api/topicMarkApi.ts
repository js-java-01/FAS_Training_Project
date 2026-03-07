import type { CourseClasses, GradebookTableResponse, GradeHistoryItem, GradeHistoryPageResponse, TrainingClassInfoResponse } from "@/types/topicMark";
import axiosInstance from "./axiosInstance";

export type TopicMarkImportResult = {
  message: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
};

export const topicMarkApi = {
  getTrainingInfo: async (classId: string): Promise<TrainingClassInfoResponse> => {
    const response = await axiosInstance.get<TrainingClassInfoResponse>(
      `/classes/${classId}/training-info`,
    );
    return response.data;
  },

  getCoursesByClassId: async (id: string): Promise<CourseClasses[]> => {
    const response = await axiosInstance.get<CourseClasses[]>(
      `/course-classes/by-class/${id}`,
    );
    return response.data;
  },

  getClassCourseById: async (id: string): Promise<CourseClasses> => {
    const response = await axiosInstance.get<CourseClasses>(
      `/course-classes/${id}`,
    );
    return response.data;
  },

  getTopicMarksById: async (
    params: { topicId: string; trainingClassId: string; page: number; pageSize: number; sort?: string | string[]; keyword?: string; passed?: boolean; }
  ): Promise<GradebookTableResponse> => {
    const response = await axiosInstance.get<GradebookTableResponse>(
      `/topics/${params.topicId}/topic-marks/search`,
      { params: { trainingClassId: params.trainingClassId, page: params.page, pageSize: params.pageSize, sort: params.sort, keyword: params.keyword, passed: params.passed } }
    )

    return response.data
  },

  getHistoryUpdateById: async (
    params: { topicId: string; trainingClassId: string; page: number; pageSize: number; sort?: string | string[]; keyword?: string; changeType?: boolean; }
  ): Promise<GradeHistoryPageResponse<GradeHistoryItem>> => {
    const response = await axiosInstance.get<GradeHistoryPageResponse<GradeHistoryItem>>(
      `/topics/${params.topicId}/topic-marks/history`,
      { params: { trainingClassId: params.trainingClassId, page: params.page, pageSize: params.pageSize, sort: params.sort, keyword: params.keyword, changeType: params.changeType } }
    )

    return response.data
  },

  updateGrade: async ({
    topicId,
    trainingClassId,
    userId,
    columnId,
    score,
    reason,
  }: {
    topicId: string
    trainingClassId: string
    userId: string
    columnId: string
    score: number
    reason: string
  }) => {
    const payload = {
      entries: [
        {
          columnId,
          score,
        },
      ],
      columnId,
      score,
      reason,
    }

    console.log("[topicMarkApi.updateGrade] request", {
      url: `/topics/${topicId}/topic-marks/${userId}?trainingClassId=${trainingClassId}`,
      payload,
    })

    return axiosInstance.put(
      `/topics/${topicId}/topic-marks/${userId}`,
      payload,
      { params: { trainingClassId } }
    )
  },

  exportTopicMark: async ({ topicId, trainingClassId }: { topicId: string; trainingClassId: string }): Promise<Blob> => {
    const response = await axiosInstance.get(`/topics/${topicId}/topic-marks/export`, {
      params: { trainingClassId },
      responseType: "blob",
    });

    return response.data;
  },

  exportTemplate: async ({ topicId, trainingClassId }: { topicId: string; trainingClassId: string }): Promise<Blob> => {
    const response = await axiosInstance.get(`/topics/${topicId}/topic-marks/export/template`, {
      params: { trainingClassId },
      responseType: "blob",
    });

    return response.data;
  },

  importTopicMark: async (formData: FormData, { topicId, trainingClassId }: { topicId: string; trainingClassId: string }): Promise<TopicMarkImportResult> => {
    const response = await axiosInstance.post<TopicMarkImportResult>(
      `/topics/${topicId}/topic-marks/import`,
      formData,
      {
        params: { trainingClassId },
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.data;
  },

};
