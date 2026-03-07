package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment_mgt.assessment.Assessment;
import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentRepository;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestionRepository;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question_option.AssessmentQuestionOption;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question_option.AssessmentQuestionOptionRepository;
import com.example.starter_project_2025.system.assessment_mgt.question.QuestionType;
import com.example.starter_project_2025.system.assessment_mgt.submission.request.StartSubmissionRequest;
import com.example.starter_project_2025.system.assessment_mgt.submission.request.SubmitAnswerRequest;
import com.example.starter_project_2025.system.assessment_mgt.submission.response.QuestionOptionResponse;
import com.example.starter_project_2025.system.assessment_mgt.submission.response.SubmissionQuestionResponse;
import com.example.starter_project_2025.system.assessment_mgt.submission.response.SubmissionResponse;
import com.example.starter_project_2025.system.assessment_mgt.submission.response.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment_mgt.submission_answer.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment_mgt.submission_question.SubmissionQuestion;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SubmissonServiceImpl
        extends CrudServiceImpl<Submission, UUID, SubmissonDTO, SubmissonFilter>
        implements SubmissonService {

    SubmissionRepository submissionRepository;
    SubmissionMapper submissionMapper;
    UserRepository userRepository;
    AssessmentRepository assessmentRepository;
    AssessmentQuestionRepository assessmentQuestionRepository;
    AssessmentQuestionOptionRepository assessmentQuestionOptionRepository;

    @Override
    protected BaseCrudRepository<Submission, UUID> getRepository() {
        return submissionRepository;
    }

    @Override
    protected BaseCrudMapper<Submission, SubmissonDTO> getMapper() {
        return submissionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{};
    }

    @Override
    public Page<SubmissonDTO> getAll(Pageable pageable, String search, SubmissonFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public SubmissonDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public SubmissonDTO create(SubmissonDTO request) {
        return super.createEntity(request);
    }

    @Override
    public SubmissonDTO update(UUID id, SubmissonDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }

    // ==================== Core Business Methods ====================

    /**
     * Start a new submission for an assessment.
     * Creates a snapshot of questions from Assessment → AssessmentQuestion → Question.
     * POST /api/submissions/start/{assessmentId}
     */
    public SubmissionResponse startSubmission(StartSubmissionRequest request) {
        // Get current authenticated user by email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));

        Assessment assessment = assessmentRepository.findByIdWithQuestions(request.getAssessmentId())
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        // Check attempt limit
        int attemptCount = submissionRepository.countByUserIdAndAssessmentId(user.getId(), assessment.getId());
        if (assessment.getAttemptLimit() != null && attemptCount >= assessment.getAttemptLimit()) {
            throw new RuntimeException(
                    "You have reached the maximum number of attempts (" + assessment.getAttemptLimit() + ") for this assessment");
        }

        // Return existing IN_PROGRESS submission if any
        Optional<Submission> existing =
                submissionRepository.findInProgressByUserAndAssessment(user.getId(), assessment.getId());
        if (existing.isPresent()) {
            return buildSubmissionResponse(existing.get(), false);
        }

        // Build new submission
        Submission submission = Submission.builder()
                .user(user)
                .assessment(assessment)
                .status(SubmissionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .totalScore(0.0)
                .isPassed(false)
                .attemptNumber(attemptCount + 1)
                .build();

        // Snapshot questions from AssessmentQuestion → Question
        List<AssessmentQuestion> assessmentQuestions = new ArrayList<>(assessment.getAssessmentQuestions());
        if (Boolean.TRUE.equals(assessment.getIsShuffleQuestion())) {
            Collections.shuffle(assessmentQuestions);
        }

        int idx = 1;
        for (AssessmentQuestion aq : assessmentQuestions) {
            String rawType = aq.getQuestion().getQuestionType();
            QuestionType questionType = parseQuestionType(rawType);
            log.debug("Snapshot question id={} type={} parsed={}", aq.getQuestion().getId(), rawType, questionType);

            SubmissionQuestion sq = SubmissionQuestion.builder()
                    .submission(submission)
                    .originalQuestionId(aq.getQuestion().getId())
                    .content(aq.getQuestion().getContent())
                    .questionType(questionType)
                    .score(aq.getScore() != null ? aq.getScore() : 0.0)
                    .orderIndex(Boolean.TRUE.equals(assessment.getIsShuffleQuestion()) ? idx++ : aq.getOrderIndex())
                    .build();
            submission.getSubmissionQuestions().add(sq);
        }

        submission = submissionRepository.save(submission);
        return buildSubmissionResponse(submission, false);
    }

    /**
     * Save / update an answer for one question.
     * POST /api/submissions/{submissionId}/answer
     */
    public SubmissionResponse submitAnswer(UUID submissionId, SubmitAnswerRequest request) {
        Submission submission = submissionRepository.findByIdWithQuestionsAndAnswers(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("This submission is no longer in progress");
        }

        // Auto-submit when time runs out
        if (isTimeExpired(submission)) {
            return submitSubmission(submissionId);
        }

        SubmissionQuestion question = submission.getSubmissionQuestions().stream()
                .filter(q -> q.getId().equals(request.getSubmissionQuestionId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found in this submission"));

        // Upsert answer
        SubmissionAnswer answer = question.getSubmissionAnswers().stream().findFirst().orElse(null);
        if (answer != null) {
            answer.setAnswerValue(request.getAnswerValue());
        } else {
            answer = SubmissionAnswer.builder()
                    .submission(submission)
                    .submissionQuestion(question)
                    .answerValue(request.getAnswerValue())
                    .build();
            question.getSubmissionAnswers().add(answer);
        }

        gradeAnswer(question, answer);
        submissionRepository.save(submission);
        return buildSubmissionResponse(submission, false);
    }

    /**
     * Finalize the submission and compute total score.
     * POST /api/submissions/{submissionId}/submit
     */
    public SubmissionResponse submitSubmission(UUID submissionId) {
        Submission submission = submissionRepository.findByIdWithQuestionsAndAnswers(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("This submission has already been submitted");
        }

        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());
        finalizeScore(submission);

        submission = submissionRepository.save(submission);
        return buildSubmissionResponse(submission, true);
    }

    /**
     * Return compact result summary.
     * GET /api/submissions/{submissionId}/result
     */
    public SubmissionResultResponse getSubmissionResult(UUID submissionId) {
        Submission submission = submissionRepository.findByIdWithQuestionsAndAnswers(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() == SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("This submission has not been submitted yet");
        }

        return buildResultResponse(submission);
    }

    /**
     * Return full submission with correct-answer info for review.
     * GET /api/submissions/{submissionId}/review
     */
    public SubmissionResponse getSubmissionForReview(UUID submissionId) {
        Submission submission = submissionRepository.findByIdWithQuestionsAndAnswers(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        return buildSubmissionResponse(submission, true);
    }

    // ==================== Private Helpers ====================

    private boolean isTimeExpired(Submission submission) {
        Integer limit = submission.getAssessment().getTimeLimitMinutes();
        if (limit == null) return false;
        return LocalDateTime.now().isAfter(submission.getStartedAt().plusMinutes(limit));
    }

    /**
     * Grade a single answer by comparing selected option IDs with correct ones.
     */
    private void gradeAnswer(SubmissionQuestion question, SubmissionAnswer answer) {
        try {
            Set<UUID> selected = Arrays.stream(answer.getAnswerValue().split(","))
                    .map(String::trim).filter(s -> !s.isEmpty())
                    .map(UUID::fromString).collect(Collectors.toSet());

            UUID assessmentId = question.getSubmission().getAssessment().getId();
            UUID originalQuestionId = question.getOriginalQuestionId();

            List<AssessmentQuestionOption> options = assessmentQuestionRepository
                    .findByAssessmentIdAndQuestionId(assessmentId, originalQuestionId)
                    .map(aq -> assessmentQuestionOptionRepository.findByAssessmentQuestionId(aq.getId()))
                    .orElse(Collections.emptyList());

            Set<UUID> correct = options.stream()
                    .filter(AssessmentQuestionOption::isCorrect)
                    .map(AssessmentQuestionOption::getId)
                    .collect(Collectors.toSet());

            boolean isCorrect = !correct.isEmpty() && selected.equals(correct);
            answer.setIsCorrect(isCorrect);
            answer.setScore(isCorrect ? question.getScore() : 0.0);
        } catch (Exception e) {
            answer.setIsCorrect(false);
            answer.setScore(0.0);
        }
    }

    private void finalizeScore(Submission submission) {
        double total = submission.getSubmissionQuestions().stream()
                .flatMap(q -> q.getSubmissionAnswers().stream())
                .map(SubmissionAnswer::getScore)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        submission.setTotalScore(total);

        double pass = submission.getAssessment().getPassScore() != null
                ? submission.getAssessment().getPassScore().doubleValue() : 0.0;
        submission.setIsPassed(total >= pass);
    }

    // ==================== Response Builders ====================

    private SubmissionResponse buildSubmissionResponse(Submission submission, boolean showCorrectAnswers) {
        List<SubmissionQuestionResponse> questions = submission.getSubmissionQuestions().stream()
                .sorted(Comparator.comparing(q -> q.getOrderIndex() != null ? q.getOrderIndex() : 0))
                .map(sq -> buildQuestionResponse(sq, showCorrectAnswers))
                .collect(Collectors.toList());

        Long remaining = calcRemainingSeconds(submission);

        return SubmissionResponse.builder()
                .submissionId(submission.getId())
                .userId(submission.getUser().getId())
                .assessmentId(submission.getAssessment().getId())
                .assessmentTitle(submission.getAssessment().getTitle())
                .status(submission.getStatus().name())
                .startedAt(submission.getStartedAt())
                .submittedAt(submission.getSubmittedAt())
                .totalScore(submission.getTotalScore())
                .isPassed(submission.getIsPassed())
                .timeLimitMinutes(submission.getAssessment().getTimeLimitMinutes())
                .remainingTimeSeconds(remaining)
                .questions(questions)
                .build();
    }

    private SubmissionQuestionResponse buildQuestionResponse(SubmissionQuestion sq, boolean showCorrectAnswers) {
        UUID assessmentId = sq.getSubmission().getAssessment().getId();
        UUID originalQuestionId = sq.getOriginalQuestionId();

        List<AssessmentQuestionOption> options = assessmentQuestionRepository
                .findByAssessmentIdAndQuestionId(assessmentId, originalQuestionId)
                .map(aq -> assessmentQuestionOptionRepository.findByAssessmentQuestionId(aq.getId()))
                .orElse(Collections.emptyList());

        if (Boolean.TRUE.equals(sq.getSubmission().getAssessment().getIsShuffleOption())) {
            options = new ArrayList<>(options);
            Collections.shuffle(options);
        }

        List<QuestionOptionResponse> optionResponses = options.stream()
                .sorted(Comparator.comparing(o -> o.getOrderIndex() != null ? o.getOrderIndex() : 0))
                .map(o -> new QuestionOptionResponse(
                        o.getId(), o.getContent(), o.getOrderIndex(),
                        showCorrectAnswers ? o.isCorrect() : null))
                .collect(Collectors.toList());

        String userAnswer = sq.getSubmissionAnswers().stream().findFirst()
                .map(SubmissionAnswer::getAnswerValue).orElse(null);
        Boolean isCorrect = sq.getSubmissionAnswers().stream().findFirst()
                .map(SubmissionAnswer::getIsCorrect).orElse(null);
        Double earnedScore = sq.getSubmissionAnswers().stream().findFirst()
                .map(SubmissionAnswer::getScore).orElse(null);

        String correctAnswer = null;
        if (showCorrectAnswers) {
            correctAnswer = options.stream().filter(AssessmentQuestionOption::isCorrect)
                    .map(o -> o.getId().toString()).collect(Collectors.joining(","));
        }

        return SubmissionQuestionResponse.builder()
                .id(sq.getId())
                .originalQuestionId(sq.getOriginalQuestionId())
                .questionType(sq.getQuestionType().name())
                .content(sq.getContent())
                .score(sq.getScore())
                .earnedScore(earnedScore)
                .orderIndex(sq.getOrderIndex())
                .isCorrect(isCorrect)
                .userAnswer(userAnswer)
                .correctAnswer(correctAnswer)
                .options(optionResponses)
                .build();
    }

    private Long calcRemainingSeconds(Submission submission) {
        Integer limit = submission.getAssessment().getTimeLimitMinutes();
        if (limit == null) return null;
        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) return 0L;
        long seconds = Duration.between(LocalDateTime.now(),
                submission.getStartedAt().plusMinutes(limit)).getSeconds();
        return Math.max(0, seconds);
    }

    private SubmissionResultResponse buildResultResponse(Submission submission) {
        List<SubmissionQuestion> questions = new ArrayList<>(submission.getSubmissionQuestions());

        int total = questions.size();
        int correct = 0, wrong = 0, unanswered = 0;
        for (SubmissionQuestion sq : questions) {
            if (sq.getSubmissionAnswers().isEmpty()) {
                unanswered++;
            } else if (Boolean.TRUE.equals(sq.getSubmissionAnswers().iterator().next().getIsCorrect())) {
                correct++;
            } else {
                wrong++;
            }
        }

        double maxScore = questions.stream()
                .map(SubmissionQuestion::getScore)
                .filter(Objects::nonNull).reduce(0.0, Double::sum);

        Long duration = null;
        if (submission.getStartedAt() != null && submission.getSubmittedAt() != null) {
            duration = Duration.between(submission.getStartedAt(), submission.getSubmittedAt()).getSeconds();
        }

        List<SubmissionQuestionResponse> details = questions.stream()
                .sorted(Comparator.comparing(q -> q.getOrderIndex() != null ? q.getOrderIndex() : 0))
                .map(sq -> buildQuestionResponse(sq, true))
                .collect(Collectors.toList());

        return SubmissionResultResponse.builder()
                .submissionId(submission.getId())
                .assessmentTitle(submission.getAssessment().getTitle())
                .totalQuestions(total)
                .correctAnswers(correct)
                .wrongAnswers(wrong)
                .unansweredQuestions(unanswered)
                .totalScore(submission.getTotalScore())
                .maxScore(maxScore)
                .passScore(submission.getAssessment().getPassScore() != null
                        ? submission.getAssessment().getPassScore().doubleValue() : null)
                .isPassed(submission.getIsPassed())
                .startedAt(submission.getStartedAt())
                .submittedAt(submission.getSubmittedAt())
                .durationSeconds(duration)
                .questionDetails(details)
                .build();
    }

    /**
     * Safely parse QuestionType — handles legacy values (SINGLE → SINGLE_CHOICE, MULTIPLE → MULTIPLE_CHOICE).
     */
    private QuestionType parseQuestionType(String raw) {
        if (raw == null) {
            log.warn("Question has null questionType, defaulting to SINGLE_CHOICE");
            return QuestionType.SINGLE_CHOICE;
        }
        return switch (raw.toUpperCase().trim()) {
            case "SINGLE", "SINGLE_CHOICE"   -> QuestionType.SINGLE_CHOICE;
            case "MULTIPLE", "MULTIPLE_CHOICE" -> QuestionType.MULTIPLE_CHOICE;
            case "ESSAY"                       -> QuestionType.ESSAY;
            default -> {
                log.warn("Unknown questionType '{}', defaulting to SINGLE_CHOICE", raw);
                yield QuestionType.SINGLE_CHOICE;
            }
        };
    }

    public List<SubmissonDTO> getLatestSubmissionsByAssessmentId(UUID assessmentId) {

        List<Submission> submissions =
                submissionRepository.findLatestSubmissionsByAssessmentId(assessmentId);

        return submissions.stream()
                .map(submissionMapper::toDto)
                .toList();
    }

    public List<SubmissonDTO> getSubmissionsByAssessmentId(UUID assessmentId) {
        List<Submission> submissions = submissionRepository.findByAssessmentId(assessmentId);

        return submissions.stream()
                .map(submissionMapper::toDto)
                .toList();
    }
}
