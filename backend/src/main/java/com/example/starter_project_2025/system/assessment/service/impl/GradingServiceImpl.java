package com.example.starter_project_2025.system.assessment.service.impl;

import com.example.starter_project_2025.system.assessment.entity.QuestionOption;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.entity.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment.entity.SubmissionQuestion;
import com.example.starter_project_2025.system.assessment.repository.QuestionOptionRepository;
import com.example.starter_project_2025.system.assessment.service.GradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GradingServiceImpl implements GradingService {

    @Autowired
    private QuestionOptionRepository questionOptionRepository;

    @Override
    public void gradeAnswer(
            SubmissionQuestion submissionQuestion,
            SubmissionAnswer submissionAnswer
    ) {
        // User chọn
        Set<UUID> selectedOptionIds = Arrays.stream(
                        submissionAnswer.getAnswerValue().split(",")
                )
                .map(UUID::fromString)
                .collect(Collectors.toSet());

        // Đáp án đúng (query từ DB)
        Set<UUID> correctOptionIds =
                questionOptionRepository
                        .findByQuestionId(
                                submissionQuestion.getOriginalQuestionId()
                        )
                        .stream()
                        .filter(QuestionOption::isCorrect)
                        .map(QuestionOption::getId)
                        .collect(Collectors.toSet());

        boolean isCorrect = selectedOptionIds.equals(correctOptionIds);

        submissionAnswer.setIsCorrect(isCorrect);
        submissionAnswer.setScore(
                isCorrect ? submissionQuestion.getScore() : 0.0
        );
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
