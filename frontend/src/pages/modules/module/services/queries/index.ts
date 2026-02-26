import { useQuery } from "@tanstack/react-query";
import { moduleApi } from "@/api/moduleApi.ts";
import { queryKeys } from "@/pages/modules/keys.ts";

export const useGetAllModules = (params: {
  page: number;
  pageSize: number;
  sort?: string | string[];
  keyword?: string;
  isActive?: boolean;
  moduleGroupId?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.modules(params),
    queryFn: () =>
      moduleApi.getAllModules({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? "displayOrder,asc",
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
        ...(params.moduleGroupId
          ? { moduleGroupId: params.moduleGroupId }
          : {}),
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
