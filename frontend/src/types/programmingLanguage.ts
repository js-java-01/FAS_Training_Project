export interface ProgrammingLanguage {
  id: number;
  name: string;
  version?: string;
  description?: string;
  isSupported: boolean;
  createdAt: string; 
  updatedAt: string; 
}

export interface ProgrammingLanguageRequest {
  name: string;
  version?: string;
  description?: string;
}

export interface ProgrammingLanguageResponse {
  id: number;
  name: string;
  version?: string;
  description?: string;
  isSupported: boolean;
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

export interface ImportResult {
  successCount: number;
  failureCount: number;
  errors?: { row: number; message: string }[];
}

export interface SearchParams {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}