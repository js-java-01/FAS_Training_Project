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
