import type { PaginationRequest } from "@/types/response";
import type { UserFilter } from "@/types/user";

export interface UsersQueryParams {
  keyword: string;
  pagination: PaginationRequest;
  filter?: UserFilter;
}

export const queryKeys = {
  users: ({ keyword, pagination, filter }: UsersQueryParams) =>
    [
      'users',
      keyword ?? '',
      pagination.page,
      pagination.size,
      pagination.sort ?? '',
      filter ?? {},
    ] as const,

  userDetail: (id: string) => ['users', 'detail', id] as const,
};
