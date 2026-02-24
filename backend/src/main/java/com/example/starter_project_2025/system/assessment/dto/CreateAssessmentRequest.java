package com.example.starter_project_2025.system.assessment.dto;

import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAssessmentRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private String assessmentTypeId;

    private Integer totalScore;

    private Integer passScore;

    private Integer timeLimitMinutes;

    private Integer attemptLimit;

    private Boolean isShuffleQuestion;

    private Boolean isShuffleOption;

    private AssessmentStatus status;
}
