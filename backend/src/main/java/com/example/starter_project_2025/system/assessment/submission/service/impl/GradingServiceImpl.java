package com.example.starter_project_2025.system.assessment.submission.service.impl;

import com.example.starter_project_2025.system.assessment.submission.entity.Submission;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionQuestion;
import com.example.starter_project_2025.system.assessment.submission.service.GradingService;
import org.springframework.stereotype.Service;

@Service
public class GradingServiceImpl implements GradingService {

    @Override
    public void gradeAnswer(
            SubmissionQuestion submissionQuestion,
            SubmissionAnswer submissionAnswer
    ) {
        // Auto grading is NOT supported yet
        // Default behavior: mark as ungraded

        submissionAnswer.setIsCorrect(null);
        // score is left unchanged (or default 0.0)
    }

    @Override
    public void finalizeSubmission(Submission submission) {

        Double totalScore = submission.getSubmissionQuestions()
                .stream()
                .flatMap(q -> q.getSubmissionAnswers().stream())
                .map(SubmissionAnswer::getScore)
                .filter(score -> score != null)
                .reduce(0.0, Double::sum);

        submission.setTotalScore(totalScore);

        // Pass / fail decision is NOT handled here
        // (requires assessment rules, not available)
    }
}
