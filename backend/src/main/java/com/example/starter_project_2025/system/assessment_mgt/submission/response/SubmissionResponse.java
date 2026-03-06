package com.example.starter_project_2025.system.assessment_mgt.submission.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmissionResponse {

    UUID submissionId;
    UUID userId;
    UUID assessmentId;
    String assessmentTitle;
    String status;
    LocalDateTime startedAt;
    LocalDateTime submittedAt;
    Double totalScore;
    Boolean isPassed;
    Integer timeLimitMinutes;
    Long remainingTimeSeconds;
    List<SubmissionQuestionResponse> questions;
}
