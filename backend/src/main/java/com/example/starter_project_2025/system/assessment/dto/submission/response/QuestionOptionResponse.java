package com.example.starter_project_2025.system.assessment.dto.submission.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionResponse {
    private UUID id;
    private String content;
    private Integer orderIndex;
    private Boolean isCorrect; // Only populated in review mode
}
