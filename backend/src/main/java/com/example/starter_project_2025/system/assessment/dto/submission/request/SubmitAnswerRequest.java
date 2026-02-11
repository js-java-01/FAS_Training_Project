package com.example.starter_project_2025.system.assessment.dto.submission.request;

import java.util.UUID;

public class SubmitAnswerRequest {

    private UUID submissionQuestionId;
    private String answerValue;

    public UUID getSubmissionQuestionId() {
        return submissionQuestionId;
    }

    public void setSubmissionQuestionId(UUID submissionQuestionId) {
        this.submissionQuestionId = submissionQuestionId;
    }

    public String getAnswerValue() {
        return answerValue;
    }

    public void setAnswerValue(String answerValue) {
        this.answerValue = answerValue;
    }
}
