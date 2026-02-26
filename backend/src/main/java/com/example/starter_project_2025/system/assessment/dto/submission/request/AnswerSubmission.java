package com.example.starter_project_2025.system.assessment.dto.submission.request;

import lombok.Data;

import java.util.UUID;

@Data
public class AnswerSubmission {
    private UUID submissionQuestionId;
    private String answerValue;
}
