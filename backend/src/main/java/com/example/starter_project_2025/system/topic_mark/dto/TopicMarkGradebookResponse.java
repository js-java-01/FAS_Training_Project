package com.example.starter_project_2025.system.topic_mark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Gradebook response containing column definitions and student rows with their scores")
public class TopicMarkGradebookResponse {

    @Schema(description = "Column definitions including assessment types and metadata columns", 
            example = "[{\"key\":\"FINAL_SCORE\",\"label\":\"Final Score\",\"weight\":null}]")
    private List<Column> columns;
    
    @Schema(description = "Student rows with their scores mapped to column keys")
    private List<Row> rows;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Column definition for gradebook")
    public static class Column {
        @Schema(description = "Column key (assessment type ID or metadata key like FINAL_SCORE)", 
                example = "FINAL_SCORE")
        private String key;
        
        @Schema(description = "Display label for the column", 
                example = "Final Score")
        private String label;
        
        @Schema(description = "Weight of the assessment type (null for metadata columns)", 
                example = "0.3", nullable = true)
        private Double weight;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Student row in gradebook with scores")
    public static class Row {
        @Schema(description = "Student user ID", 
                example = "123e4567-e89b-12d3-a456-426614174000")
        private UUID userId;
        
        @Schema(description = "Student full name", 
                example = "John Doe")
        private String fullName;
        
        @Schema(description = "Map of column keys to values (scores, pass status, comment)", 
                example = "{\"FINAL_SCORE\": 85.5, \"IS_PASSED\": true, \"COMMENT\": \"Good work\"}")
        private Map<String, Object> values;
    }
}
