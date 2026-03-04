package com.example.starter_project_2025.system.assessment_mgt.assessment.request;

import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentStatus;
import lombok.Builder;

@Builder
public record UpdateAssessmentRequest(
     String title,

     String description,

     String assessmentTypeId,

     Integer totalScore,

     Integer passScore,

     Integer timeLimitMinutes,

     Integer attemptLimit,

     Boolean isShuffleQuestion,

     Boolean isShuffleOption,

     AssessmentStatus status,

     AssessmentDifficulty difficulty
    ) {
}
