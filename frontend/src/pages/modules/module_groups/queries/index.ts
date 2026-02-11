import { useQuery } from "@tanstack/react-query";
import type { ModuleGroup } from "@/types/module";
import { queryKeys } from "./keys";
import { moduleGroupApi } from "@/api/moduleApi";
import type {PagedData} from "@/types/response.ts";

export const useGetAllModuleGroups = (params: {
    page: number;
    pageSize: number;
    sort?: string;
    keyword?: string;
}) => {
    return useQuery<PagedData<ModuleGroup>>({
        queryKey: queryKeys.moduleGroups(params),
        queryFn: () =>
            moduleGroupApi.getAllModuleGroups({
                page: params.page,
                size: params.pageSize,
                sort: params.sort ?? "displayOrder,asc",
                keyword: params.keyword,
            }),

        placeholderData: (prev?: PagedData<ModuleGroup>) => prev,
        staleTime: 5 * 60 * 1000,
    });
};

