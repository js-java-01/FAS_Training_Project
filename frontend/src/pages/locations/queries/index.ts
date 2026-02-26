import { useQuery } from "@tanstack/react-query";
import { locationApi } from "@/api/locationApi";
import { queryKeys } from "../keys";
import type { LocationStatus } from "@/types/location";
import type { PagedData } from "@/types/response";
import type { Location } from "@/types/location";

export const useGetAllLocations = (params: {
    page: number;
    pageSize: number;
    sort?: string;
    keyword?: string;
    status?: LocationStatus | "";
}) => {
    return useQuery({
        queryKey: queryKeys.locations(params),
        queryFn: async (): Promise<PagedData<Location>> => {
            const response = await locationApi.searchLocations(
                params.page,
                params.pageSize,
                params.keyword?.trim() || undefined,
                undefined,
                params.status || undefined
            );

            // Transform to PagedData format
            return {
                items: response.content,
                pagination: {
                    page: params.page,
                    pageSize: params.pageSize,
                    totalPages: response.totalPages,
                    totalElements: response.totalElements,
                },
            };
        },
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000,
    });
};
