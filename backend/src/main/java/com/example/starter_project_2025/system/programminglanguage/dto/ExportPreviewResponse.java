package com.example.starter_project_2025.system.programminglanguage.dto;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for export preview.
 * 
 * Contains:
 * - Paginated data for preview
 * - Pagination metadata
 * - Available fields for selection
 */
public class ExportPreviewResponse {

    /** Preview data as list of field-value maps */
    private List<Map<String, Object>> content;

    /** Current page number (0-based) */
    private int page;

    /** Page size */
    private int size;

    /** Total elements matching the filter */
    private long totalElements;

    /** Total pages available */
    private int totalPages;

    /** List of available fields that can be exported */
    private List<FieldInfo> availableFields;

    // ==================== Constructors ====================

    public ExportPreviewResponse() {}

    public ExportPreviewResponse(
            List<Map<String, Object>> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            List<FieldInfo> availableFields
    ) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.availableFields = availableFields;
    }

    // ==================== Getters & Setters ====================

    public List<Map<String, Object>> getContent() {
        return content;
    }

    public void setContent(List<Map<String, Object>> content) {
        this.content = content;
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

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public List<FieldInfo> getAvailableFields() {
        return availableFields;
    }

    public void setAvailableFields(List<FieldInfo> availableFields) {
        this.availableFields = availableFields;
    }

    // ==================== Nested Class ====================

    /**
     * Metadata about an exportable field.
     */
    public static class FieldInfo {
        private String name;
        private String label;
        private String type;
        private boolean defaultSelected;

        public FieldInfo() {}

        public FieldInfo(String name, String label, String type, boolean defaultSelected) {
            this.name = name;
            this.label = label;
            this.type = type;
            this.defaultSelected = defaultSelected;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public boolean isDefaultSelected() {
            return defaultSelected;
        }

        public void setDefaultSelected(boolean defaultSelected) {
            this.defaultSelected = defaultSelected;
        }
    }
}
