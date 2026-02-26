package com.example.starter_project_2025.system.assessment.service.impl;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.dto.UserAssessmentDTO;
import com.example.starter_project_2025.system.assessment.entity.*;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.enums.QuestionType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.dto.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.request.SubmitSubmissionRequest;
import com.example.starter_project_2025.system.assessment.dto.submission.response.QuestionOptionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionQuestionResponse;
import com.example.starter_project_2025.system.assessment.dto.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment.enums.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.mapper.SubmissionMapper;
import com.example.starter_project_2025.system.assessment.repository.QuestionOptionRepository;
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
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final SubmissionMapper submissionMapper;
    private final QuestionOptionRepository questionOptionRepository;
    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private GradingService gradingService;

    /* ===== Student flow ===== */

    @Override
    public Submission startSubmission(UUID userId, StartSubmissionRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Assessment assessment = assessmentRepository.findByIdWithQuestions(request.getAssessmentId())
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

        SubmissionAnswer answer;

        // ===== AUTO-SAVE: UPDATE OR CREATE =====
        if (!question.getSubmissionAnswers().isEmpty()) {
            // Update existing answer (auto-save support)
            answer = question.getSubmissionAnswers().get(0);
            answer.setAnswerValue(request.getAnswerValue());
        } else {
            // Create new answer
            answer = SubmissionAnswer.builder()
                    .submission(submission)
                    .submissionQuestion(question)
                    .answerValue(request.getAnswerValue())
                    .build();
            question.getSubmissionAnswers().add(answer);
        }

        gradingService.gradeAnswer(question, answer);

        return submission;
    }

    @Override
    public Submission submitSubmission(UUID submissionId, SubmitSubmissionRequest request) {

        Submission submission = getSubmissionById(submissionId);

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new BadRequestException("Submission already submitted");
        }

        // Process bulk answers if provided
        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            request.getAnswers().forEach(answerSubmission -> {
                SubmissionQuestion question = submission.getSubmissionQuestions()
                        .stream()
                        .filter(q -> q.getId().equals(answerSubmission.getSubmissionQuestionId()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("Submission question not found"));

                SubmissionAnswer answer;

                if (!question.getSubmissionAnswers().isEmpty()) {
                    // Update existing answer
                    answer = question.getSubmissionAnswers().get(0);
                    answer.setAnswerValue(answerSubmission.getAnswerValue());
                } else {
                    // Create new answer
                    answer = SubmissionAnswer.builder()
                            .submission(submission)
                            .submissionQuestion(question)
                            .answerValue(answerSubmission.getAnswerValue())
                            .build();
                    question.getSubmissionAnswers().add(answer);
                }

                gradingService.gradeAnswer(question, answer);
            });
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
            Long assessmentId,
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
        return submissionRepository.findByIdWithQuestions(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserAssessmentDTO> getUserAssessments(UUID userId) {
        List<Assessment> assessments = assessmentRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt")
        ).stream()
                .filter(a -> a.getStatus() == AssessmentStatus.ACTIVE)
                .collect(Collectors.toList());

        return assessments.stream().map(assessment -> {
            long attemptCount = submissionRepository.countByUserIdAndAssessmentId(userId, assessment.getId());

            List<Submission> userSubmissions = submissionRepository.findAll().stream()
                    .filter(s -> s.getUser().getId().equals(userId) && s.getAssessment().getId().equals(assessment.getId()))
                    .sorted(Comparator.comparing(Submission::getStartedAt).reversed())
                    .collect(Collectors.toList());

            Submission latest = userSubmissions.isEmpty() ? null : userSubmissions.get(0);

            UserAssessmentDTO dto = new UserAssessmentDTO();
            dto.setAssessmentId(assessment.getId());
            dto.setCode(assessment.getCode());
            dto.setTitle(assessment.getTitle());
            dto.setDescription(assessment.getDescription());
            dto.setTotalScore(assessment.getTotalScore());
            dto.setPassScore(assessment.getPassScore());
            dto.setTimeLimitMinutes(assessment.getTimeLimitMinutes());
            dto.setAttemptLimit(assessment.getAttemptLimit());
            dto.setAttemptCount(attemptCount);
            dto.setLatestStatus(latest != null ? latest.getStatus().name() : "NEW");
            dto.setIsPassed(latest != null ? latest.getIsPassed() : null);
            dto.setLastSubmissionId(latest != null ? latest.getId() : null);

            return dto;
        }).collect(Collectors.toList());
    }

    /* ===== DTO methods with enrichment logic ===== */

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionResponseById(UUID submissionId) {
        Submission submission = getSubmissionById(submissionId);
        return enrichSubmissionResponse(submission);
    }

    @Override
    @Transactional
    public SubmissionResponse startSubmissionAndGetResponse(UUID userId, StartSubmissionRequest request) {
        Submission submission = startSubmission(userId, request);
        return enrichSubmissionResponse(submission);
    }

    private SubmissionResponse enrichSubmissionResponse(Submission submission) {
        // Basic mapping
        SubmissionResponse response = submissionMapper.toSubmissionResponse(submission);

        // Enrich each question with options
        if (response.getSubmissionQuestions() != null) {
            response.getSubmissionQuestions().forEach(questionResponse -> {
                List<QuestionOption> options = questionOptionRepository
                        .findByQuestionId(questionResponse.getOriginalQuestionId());

                boolean isSubmitted = submission.getStatus() == SubmissionStatus.SUBMITTED;

                List<QuestionOptionResponse> optionResponses = options.stream()
                        .map(opt -> new QuestionOptionResponse(
                                opt.getId(),
                                opt.getContent(),
                                opt.getOrderIndex(),
                                isSubmitted ? opt.isCorrect() : null // Only expose correct answers after submission
                        ))
                        .collect(Collectors.toList());

                questionResponse.setOptions(optionResponses);
            });
        }

        return response;
    }
}
