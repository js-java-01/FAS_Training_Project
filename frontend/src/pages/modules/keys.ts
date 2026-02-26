export const queryKeys = {
    moduleGroups: (params: {
        page?: number;
        pageSize?: number;
        sort?: string | string[];
        keyword?: string;
    }) => ['module-groups', params] as const,

    moduleGroup: (id: string) => ['module-group', id] as const,

    modules: (params: {
        page?: number;
        pageSize?: number;
        sort?: string | string[];
        keyword?: string;
        isActive?: boolean;
        moduleGroupId?: string;
    }) => ['modules', params] as const,
};