import { useQuery } from "@tanstack/react-query";
import type { ModuleGroup } from "@/types/module";
import { queryKeys } from "./keys";
import { moduleGroupApi } from "@/api/moduleApi";
import type {PageResponse} from "@/types/pagination.ts";

export const useGetAllModuleGroups = (params: {
    page: number;
    pageSize: number;
    sort?: string;
    keyword?: string;
}) => {
    return useQuery<PageResponse<ModuleGroup>>({
        queryKey: queryKeys.moduleGroups(params),
        queryFn: () =>
            moduleGroupApi.getAllModuleGroups({
                page: params.page,
                size: params.pageSize,
                sort: params.sort ?? "displayOrder,asc",
                keyword: params.keyword,
            }),

        placeholderData: (prev?: PageResponse<ModuleGroup>) => prev,
        staleTime: 5 * 60 * 1000,
    });
};

