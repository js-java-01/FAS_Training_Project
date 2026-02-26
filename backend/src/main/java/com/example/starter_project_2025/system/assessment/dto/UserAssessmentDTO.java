package com.example.starter_project_2025.system.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAssessmentDTO {
    private Long assessmentId;
    private String code;
    private String title;
    private String description;
    private Integer totalScore;
    private Integer passScore;
    private Integer timeLimitMinutes;
    private Integer attemptLimit;
    private Long attemptCount;
    private String latestStatus;
    private Boolean isPassed;
    private UUID lastSubmissionId;
}
