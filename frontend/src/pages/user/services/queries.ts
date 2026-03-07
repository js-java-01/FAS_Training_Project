import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/features/rbac/user.api";

export const USER_QUERY_KEY = "users";

export const useGetAllUsers = (params: {
  page: number;
  pageSize: number;
  sort: string;
  searchContent?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, params],
    queryFn: () =>
      userApi.getAllUsers({
        page: params.page,
        size: params.pageSize,
        sort: params.sort,
        searchContent: params.searchContent,
        isActive: params.isActive,
      }),
    placeholderData: (prev) => prev,
    staleTime: 30 * 1000,
  });
};
