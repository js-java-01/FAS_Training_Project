package com.example.starter_project_2025.system.topic_mark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for a TopicMarkColumn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Gradebook column definition response")
public class TopicMarkColumnResponse {

    @Schema(description = "Column unique identifier")
    private UUID id;

    @Schema(description = "ID of the associated AssessmentType", example = "QUIZ")
    private String assessmentTypeId;

    @Schema(description = "Name of the AssessmentType", example = "Quiz")
    private String assessmentTypeName;

    @Schema(description = "Weight of the assessment type in the final score calculation", example = "0.3")
    private Double weight;

    @Schema(description = "Grading method applied across all columns of this type", example = "HIGHEST")
    private String gradingMethod;

    @Schema(description = "Display label for this column", example = "Quiz 1")
    private String columnLabel;

    @Schema(description = "Order index within the same assessment type", example = "1")
    private Integer columnIndex;
}
