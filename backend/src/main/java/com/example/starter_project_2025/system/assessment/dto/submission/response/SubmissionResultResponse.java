package com.example.starter_project_2025.system.assessment.dto.submission.response;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class SubmissionResultResponse {

    private UUID submissionId;
    private Integer totalScore;
    private Integer passScore;
    private Boolean isPassed;

}
