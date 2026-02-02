export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
}

export interface PagedData<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
}

export interface PaginationRequest {
  page: number; 
  size: number;
  sort?: string; // "createdAt,desc"
}
