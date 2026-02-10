package com.example.starter_project_2025.system.assessment.submission.service;

import com.example.starter_project_2025.system.assessment.submission.entity.Submission;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionQuestion;

public interface GradingService {

    void gradeAnswer(
            SubmissionQuestion submissionQuestion,
            SubmissionAnswer submissionAnswer
    );

    void finalizeSubmission(Submission submission);
}
