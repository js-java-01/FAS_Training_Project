package com.example.starter_project_2025.system.topic_mark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Response DTO for gradebook view with dynamic columns.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicMarkGradebookResponse {

    private List<Column> columns;
    private List<Row> rows;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Column {
        private String key;
        private String label;
        private Double weight; // null for non-assessment columns like FINAL_SCORE
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Row {
        private UUID userId;
        private String fullName;
        private Map<String, Object> values; // column key -> value
    }
}
