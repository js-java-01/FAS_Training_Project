package com.example.starter_project_2025.system.topic_mark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating a TopicMarkColumn.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create or update a gradebook column")
public class TopicMarkColumnRequest {

    @NotNull(message = "assessmentTypeId is required")
    @Schema(description = "ID of the AssessmentType (Quiz, Assignment, Final, ...)", example = "QUIZ", required = true)
    private String assessmentTypeId;

    @NotBlank(message = "columnLabel is required")
    @Size(min = 1, max = 100, message = "columnLabel must be between 1 and 100 characters")
    @Schema(description = "Display label for the column", example = "Quiz 1", required = true)
    private String columnLabel;
}
