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
 * Gradebook view response with dynamic columns per CourseClass.
 *
 * Column keys in {@link Row#values}:
 *  - UUID string  → score for a TopicMarkColumn
 *  - "FINAL_SCORE" → computed final score (Double or null)
 *  - "IS_PASSED"  → Boolean
 *  - "COMMENT"    → String
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Gradebook response containing dynamic column definitions and student rows with their scores")
public class TopicMarkGradebookResponse {

    @Schema(description = "Ordered column definitions – dynamic score columns first, then meta columns")
    private List<Column> columns;

    @Schema(description = "One row per enrolled student")
    private List<Row> rows;

    // ── Inner types ───────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Column definition for the gradebook table")
    public static class Column {

        @Schema(description = "Unique key: UUID of TopicMarkColumn or a reserved key (FINAL_SCORE, IS_PASSED, COMMENT)",
                example = "123e4567-e89b-12d3-a456-426614174000")
        private String key;

        @Schema(description = "Display label", example = "Quiz 1")
        private String label;

        @Schema(description = "AssessmentType ID this column belongs to, null for meta columns",
                nullable = true, example = "QUIZ")
        private String assessmentTypeId;

        @Schema(description = "AssessmentType name, null for meta columns",
                nullable = true, example = "Quiz")
        private String assessmentTypeName;

        @Schema(description = "Weight of the whole assessment type (same for all columns under the same type)",
                nullable = true, example = "0.3")
        private Double weight;

        @Schema(description = "Grading method used across this assessment type's columns",
                nullable = true, example = "HIGHEST")
        private String gradingMethod;

        @Schema(description = "Column order index within its assessment type, null for meta columns",
                nullable = true, example = "1")
        private Integer columnIndex;

        /** Convenience constructor for meta columns (FINAL_SCORE, IS_PASSED, COMMENT). */
        public Column(String key, String label) {
            this.key = key;
            this.label = label;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Student row in the gradebook")
    public static class Row {

        @Schema(description = "Student user ID")
        private UUID userId;

        @Schema(description = "Student full name", example = "John Doe")
        private String fullName;

        /**
         * Map of column key → value.
         * - UUID key      → Double score (nullable = not entered yet)
         * - FINAL_SCORE   → Double (nullable)
         * - IS_PASSED     → Boolean
         * - COMMENT       → String (nullable)
         */
        @Schema(description = "Score / meta values keyed by column key")
        private Map<String, Object> values;
    }
}

