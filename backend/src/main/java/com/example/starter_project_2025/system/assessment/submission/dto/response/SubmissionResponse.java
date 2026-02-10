package com.example.starter_project_2025.system.assessment.submission.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class SubmissionResponse {

    private UUID id;
    private UUID userId;
    private UUID assessmentId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Integer totalScore;
    private Boolean isPassed;


}
