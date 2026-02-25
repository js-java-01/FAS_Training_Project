import { useQuery } from "@tanstack/react-query";
import { roleApi } from "@/api/roleApi";

export const ROLE_QUERY_KEY = "roles";

export const useGetAllRoles = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
}) => {
  return useQuery({
    queryKey: [ROLE_QUERY_KEY, params],
    queryFn: () =>
      roleApi.getAllRoles({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? "name,asc",
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
