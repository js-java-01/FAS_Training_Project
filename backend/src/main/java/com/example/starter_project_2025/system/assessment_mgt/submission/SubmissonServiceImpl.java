package com.example.starter_project_2025.system.assessment_mgt.submission;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.system.assessment_mgt.assessment.Assessment;
import com.example.starter_project_2025.system.assessment_mgt.assessment.AssessmentRepository;
import com.example.starter_project_2025.system.assessment_mgt.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment_mgt.question.QuestionType;
import com.example.starter_project_2025.system.assessment_mgt.question_option.QuestionOption;
import com.example.starter_project_2025.system.assessment_mgt.question_option.QuestionOptionRepository;
import com.example.starter_project_2025.system.assessment_mgt.submission_answer.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment_mgt.submission_question.SubmissionQuestion;
import com.example.starter_project_2025.system.rbac.user.User;
import com.example.starter_project_2025.system.rbac.user.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SubmissonServiceImpl
        extends CrudServiceImpl<Submission, UUID, SubmissonDTO, SubmissonFilter>
        implements SubmissonService {

    SubmissionRepository submissionRepository;
    SubmissionMapper submissionMapper;
    UserRepository userRepository;
    AssessmentRepository assessmentRepository;
    QuestionOptionRepository questionOptionRepository;

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

    public Submission startSubmission(UUID userId, UUID assessmentId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        Submission submission = Submission.builder()
                .user(user)
                .assessment(assessment)
                .status(SubmissionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();

        for (AssessmentQuestion aq : assessment.getAssessmentQuestions()) {

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
        }

        return submissionRepository.save(submission);
    }

    public Submission submitAnswer(UUID submissionId,
                                   UUID submissionQuestionId,
                                   String answerValue) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Submission not in progress");
        }

        SubmissionQuestion question = submission.getSubmissionQuestions()
                .stream()
                .filter(q -> q.getId().equals(submissionQuestionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found"));

        SubmissionAnswer answer;

        if (!question.getSubmissionAnswers().isEmpty()) {

            answer = question.getSubmissionAnswers().get(0);
            answer.setAnswerValue(answerValue);

        } else {

            answer = SubmissionAnswer.builder()
                    .submission(submission)
                    .submissionQuestion(question)
                    .answerValue(answerValue)
                    .build();

            question.getSubmissionAnswers().add(answer);
        }

        gradeAnswer(question, answer);

        return submission;
    }

    public Submission submitSubmission(UUID submissionId) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.IN_PROGRESS) {
            throw new RuntimeException("Already submitted");
        }

        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());

        finalizeScore(submission);

        return submissionRepository.save(submission);
    }


    private void gradeAnswer(SubmissionQuestion question,
                             SubmissionAnswer answer) {

        Set<UUID> selectedOptionIds = Arrays.stream(
                        answer.getAnswerValue().split(","))
                .map(UUID::fromString)
                .collect(Collectors.toSet());

        Set<UUID> correctOptionIds =
                questionOptionRepository
                        .findByQuestionId(question.getOriginalQuestionId())
                        .stream()
                        .filter(QuestionOption::isCorrect)
                        .map(QuestionOption::getId)
                        .collect(Collectors.toSet());

        boolean isCorrect = selectedOptionIds.equals(correctOptionIds);

        answer.setIsCorrect(isCorrect);

        answer.setScore(
                isCorrect ? question.getScore() : 0.0
        );
    }

    private void finalizeScore(Submission submission) {

        Double totalScore = submission.getSubmissionQuestions()
                .stream()
                .flatMap(q -> q.getSubmissionAnswers().stream())
                .map(SubmissionAnswer::getScore)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        submission.setTotalScore(totalScore);

        Double passScore = submission.getAssessment().getPassScore().doubleValue();

        submission.setIsPassed(totalScore >= passScore);
    }

}
