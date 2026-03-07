import { useQuery } from "@tanstack/react-query";
import { courseApi } from "@/api/courseApi";

export const useGetCourseSchemeConfig = (courseId?: string) => {
  return useQuery({
    queryKey: ["course-scheme-config", courseId],
    queryFn: () => courseApi.getSchemeConfig(courseId!),
    enabled: !!courseId,
  });
};