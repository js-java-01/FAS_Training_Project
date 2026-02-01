package com.example.starter_project_2025.system.programminglanguage.controller;

import com.example.starter_project_2025.system.programminglanguage.dto.ExportPreviewResponse;
import com.example.starter_project_2025.system.programminglanguage.dto.ExportRequest;
import com.example.starter_project_2025.system.programminglanguage.service.ProgrammingLanguageExportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * REST Controller for export operations.
 * 
 * Endpoints:
 * - POST /api/programming-languages/export/preview - Get paginated preview
 * - POST /api/programming-languages/export - Download export file
 */
@RestController
@RequestMapping("/api/programming-languages/export")
@RequiredArgsConstructor
public class ProgrammingLanguageExportController {

    private final ProgrammingLanguageExportService exportService;

    /**
     * Returns paginated preview data based on filters, sorting, and pagination.
     * 
     * This endpoint allows users to preview what will be exported before
     * committing to the export operation.
     *
     * @param request Export request with filters and pagination
     * @return Preview response with data and available fields
     */
    @PostMapping("/preview")
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ExportPreviewResponse getPreview(@RequestBody ExportRequest request) {
        return exportService.getPreview(request);
    }

    /**
     * Generates and downloads an export file.
     * 
     * Uses the same filters and sorting as the preview, plus:
     * - Selected fields to include
     * - Export format (EXCEL, CSV, etc.)
     * - Optional total entries limit
     *
     * @param request Export request with all parameters
     * @return File download response
     */
    @PostMapping
    @PreAuthorize("hasAuthority('PROGRAMMING_LANGUAGE_READ')")
    public ResponseEntity<Resource> export(@Valid @RequestBody ExportRequest request) {
        Resource resource = exportService.export(request);
        
        String filename = generateFilename(request);
        String contentType = exportService.getContentType(request);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // ==================== Private Helpers ====================

    private String generateFilename(ExportRequest request) {
        String date = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String extension = exportService.getFileExtension(request);
        return String.format("programming-languages-%s.%s", date, extension);
    }
}
