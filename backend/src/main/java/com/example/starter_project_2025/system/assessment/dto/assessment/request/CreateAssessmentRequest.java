package com.example.starter_project_2025.system.assessment.dto.assessment.request;

import com.example.starter_project_2025.system.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Builder
public record CreateAssessmentRequest (

    @NotBlank
    String code,

    @NotBlank
    String title,

    String description,

    @NotNull
    String assessmentTypeId,

    Integer totalScore,

    Integer passScore,

    Integer timeLimitMinutes,

    Integer attemptLimit,

    Boolean isShuffleQuestion,

    Boolean isShuffleOption,

    AssessmentStatus status,

    AssessmentDifficulty difficulty
){
}
