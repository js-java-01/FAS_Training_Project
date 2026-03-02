import type { CourseClasses, GradebookTableResponse, GradeHistoryItem, GradeHistoryPageResponse } from "@/types/topicMark";
import axiosInstance from "./axiosInstance";
import type { useImportTopics } from "@/pages/topic/services/mutations";

export const topicMarkApi = {
  getCoursesByClassId: async (id: string): Promise<CourseClasses[]> => {
    const response = await axiosInstance.get<CourseClasses[]>(
      `/course-classes/by-class/${id}`,
    );
    return response.data;
  },

  getTopicMarksById: async (
    params: { id: string; page: number; pageSize: number; sort?: string | string[]; keyword?: string; passed?: boolean; }
  ): Promise<GradebookTableResponse> => {
    const response = await axiosInstance.get<GradebookTableResponse>(
      `/course-classes/${params.id}/topic-marks/search`,
      { params: { page: params.page, pageSize: params.pageSize, sort: params.sort, keyword: params.keyword, passed: params.passed } }
    )

    return response.data
  },

  getHistoryUpdateById: async (
    params: { id: string; page: number; pageSize: number; sort?: string | string[]; keyword?: string; changeType?: boolean; }
  ): Promise<GradeHistoryPageResponse<GradeHistoryItem>> => {
    const response = await axiosInstance.get<GradeHistoryPageResponse<GradeHistoryItem>>(
      `/course-classes/${params.id}/topic-marks/history`,
      { params: { page: params.page, pageSize: params.pageSize, sort: params.sort, keyword: params.keyword, changeType: params.changeType } }
    )

    return response.data
  },

  updateGrade: async ({
    courseClassId,
    userId,
    columnId,
    score,
    reason,
  }: {
    courseClassId: string
    userId: string
    columnId: string
    score: number
    reason: string
  }) =>
    axiosInstance.put(
      `/course-classes/${courseClassId}/topic-marks/${userId}`,
      {
        entries: [
          {
            columnId,
            score,
          },
        ],
        reason,
      }
    ),

    exportTopicMark: async (id: string): Promise<Blob> => {
      const res = await axiosInstance.get(`/course-classes/${id}/topic-marks/export`, {
        responseType: "blob",
      });

      return res.data;
  },

  exportTemplate: async (id: string): Promise<Blob> => {
    const res = await axiosInstance.get(`/course-classes/${id}/topic-marks/export/template`, {
      responseType: "blob",
    });

    return res.data;
  },

  importTopicMark: async (formData: FormData) => {
    return axiosInstance.post("/course-classes/topic-marks/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

};
