import { useQuery } from "@tanstack/react-query";
import { moduleApi } from "@/api/moduleApi";
import {queryKeys} from "@/pages/modules/module_groups/queries/keys.ts";

export const useGetAllModules = (params: {
    page: number;
    pageSize: number;
    sort?: string;
    keyword?: string;
}) => {
    return useQuery({
        queryKey: queryKeys.modules(params),
        queryFn: () => moduleApi.getAllModules({
            page: params.page,
            size: params.pageSize,
            sort: params.sort ?? "displayOrder,asc",
            ...(params.keyword?.trim()
                ? { keyword: params.keyword.trim() }
                : {}),
        }),
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });
};




