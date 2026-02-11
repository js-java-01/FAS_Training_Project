package com.example.starter_project_2025.system.assessment.service.impl;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.entity.*;
import com.example.starter_project_2025.system.assessment.enums.QuestionType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.dto.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.enums.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.repository.SubmissionRepository;
import com.example.starter_project_2025.system.assessment.service.GradingService;
import com.example.starter_project_2025.system.assessment.service.SubmissionService;
import com.example.starter_project_2025.system.assessment.spec.SubmissionSpecification;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private GradingService gradingService;

    /* ===== Student flow ===== */

    @Override
    public Submission startSubmission(UUID userId, StartSubmissionRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Assessment assessment = assessmentRepository.findById(request.getAssessmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        Submission submission = Submission.builder()
                .user(user)
                .assessment(assessment)
                .status(SubmissionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();

        // ===== CLONE QUESTIONS (SNAPSHOT) =====
        assessment.getAssessmentQuestions().forEach(aq -> {

            SubmissionQuestion sq = SubmissionQuestion.builder()
                    .submission(submission)
                    .originalQuestionId(aq.getQuestion().getId())
                    .content(aq.getQuestion().getContent())
                    .questionType(
                            QuestionType.valueOf(aq.getQuestion().getQuestionType())
                    )
                    .score(
                            aq.getScore() != null
                                    ? aq.getScore().doubleValue()
                                    : null
                    )
                    .orderIndex(aq.getOrderIndex())
                    .build();

            submission.getSubmissionQuestions().add(sq);
        });

        return submissionRepository.save(submission);
    }

    @Override
    public Submission submitAnswer(UUID submissionId, SubmitAnswerRequest request) {

        Submission submission = getSubmissionById(submissionId);

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new BadRequestException("Submission is not in progress");
        }

        SubmissionQuestion question = submission.getSubmissionQuestions()
                .stream()
                .filter(q -> q.getId().equals(request.getSubmissionQuestionId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Submission question not found"));

        // ===== PREVENT MULTIPLE ANSWERS =====
        if (!question.getSubmissionAnswers().isEmpty()) {
            throw new BadRequestException("Question already answered");
        }

        SubmissionAnswer answer = SubmissionAnswer.builder()
                .submission(submission)
                .submissionQuestion(question)
                .answerValue(request.getAnswerValue())
                .build();

        gradingService.gradeAnswer(question, answer);

        question.getSubmissionAnswers().add(answer);

        return submission;
    }

    @Override
    public Submission submitSubmission(UUID submissionId, SubmitSubmissionRequest request) {

        Submission submission = getSubmissionById(submissionId);

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new BadRequestException("Submission already submitted");
        }

        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());

        gradingService.finalizeSubmission(submission);

        return submission;
    }


    @Override
    @Transactional(readOnly = true)
    public Page<Submission> searchSubmissions(
            UUID userId,
            UUID assessmentId,
            Pageable pageable
    ) {

        Specification<Submission> spec = Specification
                .where(SubmissionSpecification.hasUserId(userId))
                .and(SubmissionSpecification.hasAssessmentId(assessmentId));

        return submissionRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Submission getSubmissionById(UUID submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }
}
