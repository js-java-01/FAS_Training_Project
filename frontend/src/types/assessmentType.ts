export interface AssessmentType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
export interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors?: { row: number; message: string }[];
}
export interface AssessmentTypeRequest {
  name: string;
  description: string;
}

export interface AssessmentTypeResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}