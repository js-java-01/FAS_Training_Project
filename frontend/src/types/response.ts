export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
}

export interface PagedData<T> {
    items: T[];
    pagination: Pagination;
}
