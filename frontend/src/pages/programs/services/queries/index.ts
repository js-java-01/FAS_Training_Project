import { useQuery } from "@tanstack/react-query";
import type { TrainingProgram } from "@/types/trainingProgram";
import type { PagedData } from "@/types/response";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import { trainingProgramKeys } from "../../keys";

export const useGetAllTrainingPrograms = (params: {
  page: number;
  pageSize: number;
  sort?: string[];
  keyword?: string;
}) => {
  return useQuery<PagedData<TrainingProgram>>({
    queryKey: trainingProgramKeys.all(params),
    queryFn: () =>
      trainingProgramApi.getAllTrainingPrograms({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? ["createdAt", "desc"],
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
      }),
    placeholderData: (prev?: PagedData<TrainingProgram>) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
