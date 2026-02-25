package com.example.starter_project_2025.system.topic_mark.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating topic mark comment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCommentRequest {
    private String comment;
}
