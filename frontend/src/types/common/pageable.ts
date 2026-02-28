export type SortDirection = "asc" | "desc";

export interface SortRequest {
  field: string;
  direction?: SortDirection;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginationRequest {
  page?: number;
  size?: number;
  sort?: SortRequest[];
}