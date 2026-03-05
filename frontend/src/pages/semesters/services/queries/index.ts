import { useQuery } from "@tanstack/react-query";
import type { TrainingClass } from "@/types/trainingClass";
import type { PagedData } from "@/types/response";
import { trainingClassApi } from "@/api/trainingClassApi";
import { trainingClassKeys } from "../../../training-classes/keys";

export const useGetAllTrainingClasses = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
  isActive?: boolean;
}) => {
  return useQuery<PagedData<TrainingClass>>({
    queryKey: trainingClassKeys.all(params),
    queryFn: () =>
      trainingClassApi.getAllTrainingClasses({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? "className,asc",
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      }),
    placeholderData: (prev?: PagedData<TrainingClass>) => prev,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
