package com.example.starter_project_2025.system.assessment.dto.assessment.request;

import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import lombok.Data;

@Data
public class UpdateAssessmentRequest {
    private String title;

    private String description;

    private String assessmentTypeId;

    private Integer totalScore;

    private Integer passScore;

    private Integer timeLimitMinutes;

    private Integer attemptLimit;

    private Boolean isShuffleQuestion;

    private Boolean isShuffleOption;

    private AssessmentStatus status;
}
