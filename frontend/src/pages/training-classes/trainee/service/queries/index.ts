import { useQuery } from "@tanstack/react-query";
import { trainingClassApi } from "@/api/trainingClassApi.ts";
import type { ApiResponse, PagedData } from "@/types/response";
import type { TrainingClass, TrainingClassSemesterResponse } from "@/types/trainingClass";
export const useGetAllTrainingClasses = (params: {
    page: number;
    size: number;
    keyword?: string;
    isActive?: boolean;
    sort?: string;

}) => {
    return useQuery<PagedData<TrainingClass>>({
        queryKey: ["training-classes", params],
        queryFn: () => trainingClassApi.getAllTrainingClasses(params),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });
};

export const useGetMyClasses = () => {
    return useQuery<ApiResponse<TrainingClassSemesterResponse[]>>({
        queryKey: ["my-classes", "student"],
        queryFn: () => trainingClassApi.getMyClasses(),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });
};