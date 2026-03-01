import { useQuery } from "@tanstack/react-query";
import { roleApi } from "@/api/roleApi";

export const ROLE_QUERY_KEY = "roles";

export const useGetAllRoles = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: [ROLE_QUERY_KEY, params],
    queryFn: () =>
      roleApi.getAllRoles({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? "name,asc",
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
