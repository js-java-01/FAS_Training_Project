package com.example.starter_project_2025.system.topic_mark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Detailed view of a single student's topic marks in a course class,
 * including individual column scores, computed final score, and audit history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Detailed topic mark view for a single student")
public class TopicMarkDetailResponse {

    @Schema(description = "Student user ID")
    private UUID userId;

    @Schema(description = "Student full name", example = "John Doe")
    private String fullName;

    @Schema(description = "Individual column scores grouped by assessment type")
    private List<AssessmentTypeSection> sections;

    @Schema(description = "Computed final score (null if not all columns are filled)", nullable = true, example = "85.5")
    private Double finalScore;

    @Schema(description = "Whether the student passed", example = "true")
    private Boolean isPassed;

    @Schema(description = "Full score-change audit history for this student")
    private List<HistoryEntry> history;

    // ── Inner types ──────────────────────────────────────────────────────────

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Assessment type section grouping multiple columns")
    public static class AssessmentTypeSection {

        @Schema(description = "Assessment type ID", example = "QUIZ")
        private String assessmentTypeId;

        @Schema(description = "Assessment type name", example = "Quiz")
        private String assessmentTypeName;

        @Schema(description = "Weight in final score calculation", example = "0.3")
        private Double weight;

        @Schema(description = "Grading method applied across columns in this section", example = "HIGHEST")
        private String gradingMethod;

        @Schema(description = "Computed score for this section (via gradingMethod on column scores), null if any column is missing")
        private Double sectionScore;

        @Schema(description = "Individual column scores")
        private List<ColumnScore> columns;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Score for a single column")
    public static class ColumnScore {

        @Schema(description = "Column UUID", example = "123e4567-e89b-12d3-a456-426614174000")
        private UUID columnId;

        @Schema(description = "Column display label", example = "Quiz 1")
        private String columnLabel;

        @Schema(description = "Column order index", example = "1")
        private Integer columnIndex;

        @Schema(description = "Student score, null = not yet entered", nullable = true, example = "8.5")
        private Double score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Audit entry for a score change")
    public static class HistoryEntry {

        @Schema(description = "Label of the column that was changed", example = "Quiz 1")
        private String columnLabel;

        @Schema(description = "Score before the change", nullable = true, example = "7.0")
        private Double oldScore;

        @Schema(description = "Score after the change", nullable = true, example = "8.5")
        private Double newScore;

        @Schema(description = "Type of change: INCREASE or DECREASE", example = "INCREASE")
        private String changeType;

        @Schema(description = "Reason provided for the change", example = "Re-graded after review")
        private String reason;

        @Schema(description = "Full name of the user who made the change", example = "Trainer A")
        private String updatedBy;

        @Schema(description = "Timestamp of the change")
        private LocalDateTime updatedAt;
    }
}
