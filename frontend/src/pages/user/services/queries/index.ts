import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";

export const USER_QUERY_KEY = "users";

export const useGetAllUsers = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  searchContent?: string;
}) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY, params],
    queryFn: () =>
      userApi.getAllUsers({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? "createdAt,desc",
        ...(params.searchContent?.trim()
          ? { searchContent: params.searchContent.trim() }
          : {}),
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
