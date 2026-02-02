package com.example.starter_project_2025.system.programminglanguage.service;

import com.example.starter_project_2025.system.programminglanguage.dto.ExportPreviewResponse;
import com.example.starter_project_2025.system.programminglanguage.dto.ExportRequest;
import com.example.starter_project_2025.system.programminglanguage.entity.ProgrammingLanguage;
import com.example.starter_project_2025.system.programminglanguage.export.ExportService;
import com.example.starter_project_2025.system.programminglanguage.export.ExportServiceFactory;
import com.example.starter_project_2025.system.programminglanguage.export.ProgrammingLanguageFieldMapper;
import com.example.starter_project_2025.system.programminglanguage.repository.ProgrammingLanguageRepository;
import com.example.starter_project_2025.system.programminglanguage.specification.ProgrammingLanguageSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * Service for export preview and export operations.
 * 
 * Handles:
 * - Preview with filters, sorting, pagination
 * - Export with same filters and field selection
 * - Consistent data between preview and export
 */
@Service
@RequiredArgsConstructor
public class ProgrammingLanguageExportService {

    private final ProgrammingLanguageRepository repository;
    private final ProgrammingLanguageFieldMapper fieldMapper;
    private final ExportServiceFactory exportServiceFactory;

    /**
     * Returns paginated preview data based on export request.
     *
     * @param request Export request with filters, sorting, pagination
     * @return Preview response with data and metadata
     */
    public ExportPreviewResponse getPreview(ExportRequest request) {
        // Build specification from request
        Specification<ProgrammingLanguage> spec = ProgrammingLanguageSpecification.withFilters(
                request.getKeyword(),
                request.getFilters()
        );

        // Build pageable with sorting
        Pageable pageable = buildPageable(request);

        // Execute query
        Page<ProgrammingLanguage> page = repository.findAll(spec, pageable);

        // Determine fields to include in preview
        List<String> fieldsToShow = fieldMapper.validateFields(request.getSelectedFields());
        if (fieldsToShow.isEmpty()) {
            fieldsToShow = fieldMapper.getAllFieldNames();
        }

        // Convert entities to maps with selected fields
        List<Map<String, Object>> content = fieldMapper.toMapList(page.getContent(), fieldsToShow);

        return new ExportPreviewResponse(
                content,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                fieldMapper.getAvailableFields()
        );
    }

    /**
     * Generates export file based on request.
     *
     * @param request Export request with filters, sorting, field selection
     * @return Resource containing the exported file
     */
    public Resource export(ExportRequest request) {
        // Build specification from request
        Specification<ProgrammingLanguage> spec = ProgrammingLanguageSpecification.withFilters(
                request.getKeyword(),
                request.getFilters()
        );

        // Build sorting
        Sort sort = buildSort(request);

        // Determine how many records to export
        List<ProgrammingLanguage> entities;
        if (request.getTotalEntries() != null && request.getTotalEntries() > 0) {
            // Export limited number of entries
            Pageable pageable = PageRequest.of(0, request.getTotalEntries(), sort);
            entities = repository.findAll(spec, pageable).getContent();
        } else {
            // Export all matching records
            entities = repository.findAll(spec, sort);
        }

        // Validate and get selected fields
        List<String> selectedFields = fieldMapper.validateFields(request.getSelectedFields());
        if (selectedFields.isEmpty()) {
            selectedFields = fieldMapper.getAllFieldNames();
        }

        // Convert to export format
        List<Map<String, Object>> rows = fieldMapper.toMapList(entities, selectedFields);

        // Get appropriate export service and generate file
        ExportService exportService = exportServiceFactory.getService(request.getFormat());
        return exportService.export(rows, selectedFields, "Programming Languages");
    }

    /**
     * Returns the content type for the given export format.
     */
    public String getContentType(ExportRequest request) {
        return exportServiceFactory.getService(request.getFormat()).getContentType();
    }

    /**
     * Returns the file extension for the given export format.
     */
    public String getFileExtension(ExportRequest request) {
        return exportServiceFactory.getService(request.getFormat()).getFileExtension();
    }

    // ==================== Private Helpers ====================

    private Pageable buildPageable(ExportRequest request) {
        Sort sort = buildSort(request);
        return PageRequest.of(request.getPage(), request.getSize(), sort);
    }

    private Sort buildSort(ExportRequest request) {
        String sortBy = StringUtils.hasText(request.getSortBy()) ? request.getSortBy() : "name";
        Sort.Direction direction = "DESC".equalsIgnoreCase(request.getSortDirection())
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(direction, sortBy);
    }
}
