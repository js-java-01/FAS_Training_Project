import { userApi } from "@/api/services/userApi";
import type { PagedData } from "@/types/response";
import type { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, type UsersQueryParams } from "./keys";

export const useGetAllUsers = ({
  keyword,
  pagination,
  filter,
}: UsersQueryParams) => {
  return useQuery<PagedData<User>>({
    queryKey: queryKeys.users({ keyword, pagination, filter }),

    queryFn: () => userApi.getAll(keyword, pagination, filter),

    placeholderData: (prev?: PagedData<User>) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
