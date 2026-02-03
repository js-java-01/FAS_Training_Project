import { useQuery } from "@tanstack/react-query";
import type { ModuleGroup } from "@/types/module";
import { queryKeys } from "../../keys.ts";
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
                ...(params.keyword?.trim()
                    ? { keyword: params.keyword.trim() }
                    : {}),
            }),

        placeholderData: (prev?: PagedData<ModuleGroup>) => prev,
        staleTime: 5 * 60 * 1000,
    });
};

