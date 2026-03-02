import type { CourseClasses, GradebookTableResponse, GradeHistoryItem, GradeHistoryPageResponse } from "@/types/topicMark";
import axiosInstance from "./axiosInstance";

export const topicMarkApi = {
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
      url: `/course-classes/${courseClassId}/topic-marks/${userId}`,
      payload,
    })

    return axiosInstance.put(
      `/course-classes/${courseClassId}/topic-marks/${userId}`,
      payload
    )
  },

    exportTopicMark: async (id: string): Promise<Blob> => {
      const res = await axiosInstance.get(`/course-classes/${id}/topic-marks/export`, {
        responseType: "blob",
      });

      if (res.status !== 200) {
         const text = await res.data.text();
         console.log("Error response:", text);
      }

      return res.data;
  },

  exportTemplate: async (id: string): Promise<Blob> => {
    const res = await axiosInstance.get(`/course-classes/${id}/topic-marks/export/template`, {
      responseType: "blob",
    });

    if (res.status !== 200) {
       const text = await res.data.text();
       console.log("Error response:", text);
    }

    return res.data;
  },

  importTopicMark: async (formData: FormData, id: string) => {
    return axiosInstance.post(`/course-classes/${id}/topic-marks/import`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

};
