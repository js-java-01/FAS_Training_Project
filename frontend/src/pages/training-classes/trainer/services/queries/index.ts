import { useQuery } from "@tanstack/react-query";
import { classDetailsApi, trainingClassApi } from "@/api/trainingClassApi";
import type { ApiResponse } from "@/types/response";
import type { TrainerClassSemesterResponse } from "@/types/trainerClass";

export const useGetTrainerClasses = (params: {
  semesterId: string;
  keyword?: string;
  isActive?: boolean;
  classStatus?: string;
}) => {
  const queryParams = {
    semesterId: params.semesterId,
    ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
    ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
    ...(params.classStatus ? { classStatus: params.classStatus } : {}),
  };

  return useQuery<ApiResponse<TrainerClassSemesterResponse>>({
    queryKey: ["trainer-classes", queryParams],
    queryFn: () => trainingClassApi.getTrainerClasses(queryParams),
    enabled: !!params.semesterId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetClassTrainees = (classId: string, params: any) => {
  return useQuery({
    queryKey: ["class-trainees", classId, params],
    queryFn: () => classDetailsApi.getTrainees(classId, params),
    enabled: !!classId,
    placeholderData: (prev) => prev,
  });
};

export const useGetClassCourses = (classId: string, params: any) => {
  return useQuery({
    queryKey: ["class-courses", classId, params],
    queryFn: () => classDetailsApi.getCourses(classId, params),
    enabled: !!classId,
    placeholderData: (prev) => prev,
  });
};
