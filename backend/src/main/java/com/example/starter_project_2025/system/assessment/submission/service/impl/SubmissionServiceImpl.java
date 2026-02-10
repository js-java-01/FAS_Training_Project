package com.example.starter_project_2025.system.assessment.submission.service.impl;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.submission.dto.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.submission.dto.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.submission.dto.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.submission.entity.Submission;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionQuestion;
import com.example.starter_project_2025.system.assessment.submission.entity.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.submission.repository.SubmissionRepository;
import com.example.starter_project_2025.system.assessment.submission.service.SubmissionService;
import com.example.starter_project_2025.system.assessment.submission.spec.SubmissionSpecification;
import com.example.starter_project_2025.system.assessment.submission.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.submission.exception.BadRequestException;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
    private final AssessmentTypeRepository assessmentTypeRepository;

    /* ===== Student flow ===== */

    @Override
    public Submission startSubmission(UUID userId, StartSubmissionRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AssessmentType assessmentType = assessmentTypeRepository
                .findById(String.valueOf(request.getAssessmentTypeId()))
                .orElseThrow(() -> new ResourceNotFoundException("Assessment type not found"));

        Submission submission = Submission.builder()
                .user(user)
                .status(SubmissionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();

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

        SubmissionAnswer answer = SubmissionAnswer.builder()
                .submissionQuestion(question)
                .answerValue(request.getAnswerValue())
                .build();

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

        return submission;
    }

    /* ===== Query ===== */

    @Override
    @Transactional(readOnly = true)
    public Page<Submission> searchSubmissions(
            UUID userId,
            UUID assessmentTypeId,
            Pageable pageable
    ) {

        Specification<Submission> spec = Specification
                .where(SubmissionSpecification.hasUserId(userId))
                .and(SubmissionSpecification.hasAssessmentTypeId(assessmentTypeId));

        return submissionRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Submission getSubmissionById(UUID submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }
}
