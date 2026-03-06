package com.example.starter_project_2025.system.assessment.submission.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SubmissionResultResponse {

    UUID submissionId;

    Double totalScore;

    Boolean isPassed;

    LocalDateTime submittedAt;
}
