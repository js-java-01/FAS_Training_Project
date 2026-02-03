package com.example.starter_project_2025.system.programminglanguage.export;

import org.springframework.core.io.Resource;

import java.util.List;
import java.util.Map;

/**
 * Interface for export services.
 * 
 * Implementations handle specific export formats (Excel, CSV, PDF).
 * Uses Strategy pattern for format selection.
 */
public interface ExportService {

    /**
     * Exports data to the specific format.
     *
     * @param rows Data to export as list of field-value maps
     * @param headers Column headers in order
     * @param sheetName Name for the export (e.g., sheet name in Excel)
     * @return Resource containing the exported file
     */
    Resource export(List<Map<String, Object>> rows, List<String> headers, String sheetName);

    /**
     * Returns the content type for this export format.
     *
     * @return MIME type string
     */
    String getContentType();

    /**
     * Returns the file extension for this export format.
     *
     * @return File extension (e.g., "xlsx", "csv")
     */
    String getFileExtension();
}
