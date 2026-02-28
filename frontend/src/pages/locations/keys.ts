export const queryKeys = {
    locations: (params: {
        page?: number;
        pageSize?: number;
        sort?: string;
        keyword?: string;
        status?: string;
    }) => ['locations', params] as const,

    location: (id: string) => ['location', id] as const,
};
