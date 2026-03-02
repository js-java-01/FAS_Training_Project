package com.example.starter_project_2025.system.topic_mark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for updating one or more TopicMarkEntry scores for a student,
 * with a mandatory reason for audit purposes.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to save / update scores for a student in a course class")
public class UpdateTopicMarkRequest {

    @Valid
    @NotEmpty(message = "At least one entry must be provided")
    @Schema(description = "List of column-score pairs to update", required = true)
    private List<EntryUpdate> entries;

    @Schema(description = "Reason for this score update (required for audit trail)",
            example = "Re-graded after student appeal", required = true)
    private String reason;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Score update for a single column")
    public static class EntryUpdate {

        @NotNull(message = "columnId is required")
        @Schema(description = "UUID of the TopicMarkColumn to update", required = true)
        private UUID columnId;

        @Min(value = 0, message = "score must be >= 0")
        @Max(value = 10, message = "score must be <= 10")
        @Schema(description = "New score value (0–10). Omit or send null to clear the score.",
                nullable = true, example = "8.5")
        private Double score;
    }
}
