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

// Spring Boot Page response
export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}
