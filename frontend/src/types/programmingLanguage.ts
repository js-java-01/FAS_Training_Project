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
  isSupported?: boolean;
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

// ==================== Export Types ====================

export type ExportFormat = 'EXCEL' | 'CSV' | 'PDF';

export interface ExportRequest {
  /** Global keyword search */
  keyword?: string;
  /** Field-specific filters */
  filters?: Record<string, string>;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortDirection?: 'ASC' | 'DESC';
  /** Page number (0-based) for preview */
  page?: number;
  /** Page size for preview */
  size?: number;
  /** Total entries to export (null = all) */
  totalEntries?: number;
  /** Fields to include in export */
  selectedFields: string[];
  /** Export format */
  format: ExportFormat;
}

export interface FieldInfo {
  name: string;
  label: string;
  type: string;
  defaultSelected: boolean;
}

export interface ExportPreviewResponse {
  content: Record<string, unknown>[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  availableFields: FieldInfo[];
}