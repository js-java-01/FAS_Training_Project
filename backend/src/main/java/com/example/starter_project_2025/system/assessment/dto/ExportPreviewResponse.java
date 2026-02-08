package com.example.starter_project_2025.system.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExportPreviewResponse {
    private List<Map<String, Object>> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private List<FieldInfo> availableFields;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldInfo {
        private String name;
        private String label;
        private String type;
        private boolean defaultSelected;
    }
}
