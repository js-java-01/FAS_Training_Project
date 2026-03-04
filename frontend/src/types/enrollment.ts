export interface EnrollmentImportResult {
    totalCount: number;
    successCount: number;
    failedCount: number;
    errorFile?: string
}