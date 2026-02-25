package com.example.starter_project_2025.system.topic_mark.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating topic mark comment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update comment for a student's topic mark")
public class UpdateCommentRequest {
    
    @Schema(
        description = "Comment text to set (can be null to clear comment)", 
        example = "Excellent performance, shows great understanding of the material",
        nullable = true
    )
    private String comment;
}
