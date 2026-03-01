import { useQuery } from "@tanstack/react-query";
import type { TrainingClass } from "@/types/trainingClass";
import { trainingClassApi } from "@/api/trainingClassApi";
import { trainingClassKeys } from "../../keys";

export const useGetTrainingClassById = (id?: string) => {
    return useQuery<TrainingClass>({
        queryKey: trainingClassKeys.detail(id ?? ""),
        queryFn: () => trainingClassApi.getTrainingClassById(id!),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        retry: false,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
    });
};
