export const queryKeys = {
    moduleGroups: (params: {
        page?: number;
        pageSize?: number;
        sort?: string;
        keyword?: string;
    }) => ['module-groups', params] as const,

    moduleGroup: (id: string) => ['module-groups', id] as const,
};
