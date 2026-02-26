package com.example.starter_project_2025.system.assessment.dto.submission.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitSubmissionRequest {

    private List<AnswerSubmission> answers;

}
