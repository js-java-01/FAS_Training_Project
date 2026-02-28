import type { CourseClasses, GradebookTableResponse } from "@/types/topicMark";
import axiosInstance from "./axiosInstance";

export const topicMarkApi = {
  getCourseByClassId: async (id: string): Promise<CourseClasses[]> => {
    const response = await axiosInstance.get<CourseClasses[]>(
      `/course-classes/by-class/${id}`,
    );
    return response.data;
  },

  getTopicMarksById: async (
    params: { id: string; page: number; pageSize: number; sort?: string | string[]; keyword?: string }
  ): Promise<GradebookTableResponse> => {
    const response = await axiosInstance.get<GradebookTableResponse>(
      `/course-classes/${params.id}/topic-marks/search`,
      { params: { page: params.page, pageSize: params.pageSize, sort: params.sort, keyword: params.keyword } }
    )

    return response.data
  },
};
