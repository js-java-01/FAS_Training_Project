package com.example.starter_project_2025.system.assessment.dto.submission.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SubmissionResultResponse {

    private UUID submissionId;
    private Double totalScore;
    private Double passScore;
    private Boolean isPassed;

}
