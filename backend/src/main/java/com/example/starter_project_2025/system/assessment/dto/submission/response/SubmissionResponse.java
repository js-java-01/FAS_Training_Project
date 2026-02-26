package com.example.starter_project_2025.system.assessment.dto.submission.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class SubmissionResponse {

    private UUID id;
    private UUID userId;
    private Long assessmentId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Double totalScore;
    private Boolean isPassed;
    private List<SubmissionQuestionResponse> submissionQuestions;

}
