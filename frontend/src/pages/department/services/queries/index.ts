import { useQuery } from "@tanstack/react-query";
import { departmentApi } from "@/api/departmentApi";

export const DEPARTMENT_QUERY_KEY = "departments";

export const useGetAllDepartments = (params: {
  page: number;
  pageSize: number;
  sort?: string;
  keyword?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: [DEPARTMENT_QUERY_KEY, params],
    queryFn: () =>
      departmentApi.getAll({
        page: params.page,
        size: params.pageSize,
        sort: params.sort ?? "name,asc",
        ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
        ...(params.status ? { status: params.status } : {}),
      }),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
