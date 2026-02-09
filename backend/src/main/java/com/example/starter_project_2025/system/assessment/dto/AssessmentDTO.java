package com.example.starter_project_2025.system.assessment.dto;

import com.example.starter_project_2025.system.assessment.entity.AssessmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssessmentDTO {
    private Long id;

    private String code;

    private String title;

    private String description;

    private Integer totalScore;

    private Integer passScore;

    private Integer timeLimitMinutes;

    private Integer attemptLimit;

    private Boolean isShuffleQuestion;

    private Boolean isShuffleOption;

    private AssessmentStatus status;

    private String assessmentTypeId;

    private String assessmentTypeName;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
