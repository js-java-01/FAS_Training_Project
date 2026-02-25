package com.example.starter_project_2025.system.assessment.service;

import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.entity.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment.entity.SubmissionQuestion;

public interface GradingService {

    void gradeAnswer(
            SubmissionQuestion submissionQuestion,
            SubmissionAnswer submissionAnswer
    );

    void finalizeSubmission(Submission submission);
}
