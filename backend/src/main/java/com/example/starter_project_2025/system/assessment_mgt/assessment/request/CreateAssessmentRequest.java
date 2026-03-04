package com.example.starter_project_2025.system.assessment_mgt.assessment.request;

import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

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
