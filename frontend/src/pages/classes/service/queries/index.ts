import { useQuery } from "@tanstack/react-query";
import { trainingClassApi } from "@/api/trainingClassApi.ts";
import type { PagedData } from "@/types/response";
import type { TrainingClass } from "@/types/trainingClass";
export const useGetAllTrainingClasses = (params: {
    page: number;
    size: number;
    keyword?: string;
    isActive?: boolean;
}) => {
    return useQuery<PagedData<TrainingClass>>({
        queryKey: ["training-classes", params],
        queryFn: () => trainingClassApi.getAllTrainingClasses(params),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });
};