import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/api/courseApi";

export const COURSE_QUERY_KEY = "courses";

export const useGetAllCourses = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
  status?: string;
  trainerId?: string;
}) => {
  return useQuery({
    queryKey: [COURSE_QUERY_KEY, params],
    queryFn: () =>
      courseApi.getCourses({
        page: params.page,
        size: params.pageSize,
        sort: params.sort,
        keyword: params.keyword,
        status: params.status,
        trainerId: params.trainerId,
      }),
    placeholderData: (prev) => prev,
  });
};
