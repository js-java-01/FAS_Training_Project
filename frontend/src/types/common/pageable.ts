export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Pagination {
  page?: number;
  size?: number;
  sort?: string;
}

export const DefaultPagination: Pagination = {
  page: 0,
  size: 10,
  sort: "id,asc",
};