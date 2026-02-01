export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;          // current page
    size: number;            // page size
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}
