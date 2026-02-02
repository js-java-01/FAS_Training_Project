package com.example.starter_project_2025.system.programminglanguage.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

/**
 * Request DTO for export preview and export operations.
 * 
 * Contains all parameters needed to:
 * - Filter data (keyword, field filters)
 * - Sort data (sortBy, sortDirection)
 * - Paginate data (page, size)
 * - Select fields (selectedFields)
 * - Choose export format (format)
 */
public class ExportRequest {

    /** Global keyword search (searches across multiple fields) */
    private String keyword;

    /** Field-specific filters (field name -> filter value) */
    private Map<String, String> filters;

    /** Field to sort by */
    private String sortBy = "name";

    /** Sort direction: ASC or DESC */
    private String sortDirection = "ASC";

    /** Page number (0-based) for preview */
    @Min(value = 0, message = "Page must be >= 0")
    private int page = 0;

    /** Page size for preview */
    @Min(value = 1, message = "Size must be >= 1")
    private int size = 10;

    /** Total entries to export (null = all matching records) */
    private Integer totalEntries;

    /** Fields/columns to include in export */
    @NotEmpty(message = "At least one field must be selected")
    private List<String> selectedFields;

    /** Export format: EXCEL, CSV, PDF */
    @NotNull(message = "Export format is required")
    private ExportFormat format = ExportFormat.EXCEL;

    // ==================== Getters & Setters ====================

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Map<String, String> getFilters() {
        return filters;
    }

    public void setFilters(Map<String, String> filters) {
        this.filters = filters;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public Integer getTotalEntries() {
        return totalEntries;
    }

    public void setTotalEntries(Integer totalEntries) {
        this.totalEntries = totalEntries;
    }

    public List<String> getSelectedFields() {
        return selectedFields;
    }

    public void setSelectedFields(List<String> selectedFields) {
        this.selectedFields = selectedFields;
    }

    public ExportFormat getFormat() {
        return format;
    }

    public void setFormat(ExportFormat format) {
        this.format = format;
    }
}
