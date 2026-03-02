import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TrainingClass, UpdateTrainingClassRequest } from "@/types/trainingClass";
import type { PagedData } from "@/types/response";
import { trainingClassApi } from "@/api/trainingClassApi";
import { trainingClassKeys } from "../../keys";
import { toast } from "sonner";

export { useGetTrainingClassById } from "./useTrainingClassDetail";

export const useGetAllTrainingClasses = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
  isActive?: boolean;
  semesterId?: string;
  classStatus?: string;
  enabled?: boolean;
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
        ...(params.semesterId ? { semesterId: params.semesterId } : {}),
        ...(params.classStatus ? { classStatus: params.classStatus } : {}),
      }),
    enabled: params.enabled ?? true,
    placeholderData: (prev?: PagedData<TrainingClass>) => prev,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateTrainingClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrainingClassRequest }) =>
      trainingClassApi.updateTrainingClass(id, data),

    onSuccess: (data) => {
      toast.success(`Cập nhật lớp học ${data.className} thành công`);
      queryClient.invalidateQueries({
        queryKey: ["training-classes"],
      });
    },

    onError: (error: any) => {
      const message = error?.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại!";
      toast.error(message);
    },

    retry: false,
  });
};
