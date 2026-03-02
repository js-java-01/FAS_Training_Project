import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "@/api/courseApi";
import { COURSE_QUERY_KEY } from "../queries";

export const useExportCourses = () =>
  useMutation({
    mutationFn: () => courseApi.exportCourses(),
  });

export const useImportCourses = () =>
{
  const queryClient = useQueryClient();
  const invalidateCourses = async () => {
    await queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEY] });
  };
  return useMutation({
    mutationFn: (file: File) => courseApi.importCourses(file),
    onSuccess: () => invalidateCourses(),
  });
}

export const useDownloadCourseTemplate = () =>
  useMutation({
    mutationFn: () => courseApi.downloadTemplate(),
  });
