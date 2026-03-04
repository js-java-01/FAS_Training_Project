package com.example.starter_project_2025.system.assessment.submission;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.assessment.Assessment;
import com.example.starter_project_2025.system.assessment.assessment.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.assessment_question.AssessmentQuestion;
import com.example.starter_project_2025.system.assessment.question.Question;
import com.example.starter_project_2025.system.assessment.question_option.QuestionOption;
import com.example.starter_project_2025.system.assessment.question_option.QuestionOptionDTO;
import com.example.starter_project_2025.system.assessment.submission.dto.StartSubmissionResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.SubmissionDetailResponse;
import com.example.starter_project_2025.system.assessment.submission.dto.SubmissionResultResponse;
import com.example.starter_project_2025.system.assessment.submission_answer.SubmissionAnswer;
import com.example.starter_project_2025.system.assessment.submission_question.SubmissionQuestion;
import com.example.starter_project_2025.system.assessment.submission_question.SubmissionQuestionDTO;
import com.example.starter_project_2025.system.assessment.submission_question.SubmissionQuestionRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import com.example.starter_project_2025.system.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SubmissionServiceImpl implements SubmissionService {

    SubmissionRepository submissionRepository;
    SubmissionQuestionRepository submissionQuestionRepository;
    AssessmentRepository assessmentRepository;
    UserRepository userRepository;
    UserService userService;

    @Override
    public StartSubmissionResponse startSubmission(UUID assessmentId) {

        User currentUser = userService.getCurrentUser();

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found"));

        int attemptCount = submissionRepository
                .countByAssessmentIdAndUserId(assessmentId, currentUser.getId());

        if (assessment.getAttemptLimit() > 0 &&
                attemptCount >= assessment.getAttemptLimit()) {
            throw new BadRequestException("Attempt limit exceeded");
        }

        Submission submission = Submission.builder()
                .assessment(assessment)
                .user(userRepository.getReferenceById(currentUser.getId()))
                .attemptNumber(attemptCount + 1)
                .status(SubmissionStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();

        for (AssessmentQuestion aq : assessment.getAssessmentQuestions()) {

            Question q = aq.getQuestion();

            SubmissionQuestion sq = SubmissionQuestion.builder()
                    .submission(submission)
                    .originalQuestion(q)
                    .content(q.getContent())
                    .questionType(q.getQuestionType())
                    .maxScore(aq.getScore())
                    .orderIndex(aq.getOrderIndex())
                    .build();

            submission.getSubmissionQuestions().add(sq);
        }

        submissionRepository.save(submission);

        return StartSubmissionResponse.builder()
                .submissionId(submission.getId())
                .attemptNumber(submission.getAttemptNumber())
                .startedAt(submission.getStartedAt())
                .build();
    }

    @Override
    @Transactional
    public void saveAnswer(UUID submissionQuestionId, List<UUID> selectedOptionIds) {

        SubmissionQuestion sq = submissionQuestionRepository.findById(submissionQuestionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission question not found"));

        sq.getSubmissionAnswers().clear();

        for (UUID optionId : selectedOptionIds) {
            SubmissionAnswer answer = SubmissionAnswer.builder()
                    .submissionQuestion(sq)
                    .optionId(optionId)
                    .build();

            sq.getSubmissionAnswers().add(answer);
        }
    }

    @Override
    @Transactional
    public SubmissionResultResponse submit(UUID submissionId) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        double totalScore = 0;

        for (SubmissionQuestion sq : submission.getSubmissionQuestions()) {

            Question original = sq.getOriginalQuestion();

            Set<UUID> correctOptionIds = original.getOptions()
                    .stream()
                    .filter(QuestionOption::getIsCorrect)
                    .map(QuestionOption::getId)
                    .collect(Collectors.toSet());

            Set<UUID> selectedIds = sq.getSubmissionAnswers()
                    .stream()
                    .map(SubmissionAnswer::getOptionId)
                    .collect(Collectors.toSet());

            boolean isCorrect = correctOptionIds.equals(selectedIds);

            double earned = isCorrect ? sq.getMaxScore() : 0;

            sq.setEarnedScore(earned);

            for (SubmissionAnswer ans : sq.getSubmissionAnswers()) {
                ans.setIsCorrect(correctOptionIds.contains(ans.getOptionId()));
                ans.setScore(isCorrect ? sq.getMaxScore() : 0);
            }

            totalScore += earned;
        }

        submission.setTotalScore(totalScore);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.SUBMITTED);

        submission.setIsPassed(
                totalScore >= submission.getAssessment().getPassScore()
        );

        return SubmissionResultResponse.builder()
                .submissionId(submission.getId())
                .totalScore(submission.getTotalScore())
                .isPassed(submission.getIsPassed())
                .submittedAt(submission.getSubmittedAt())
                .build();
    }

    @Override
    @Transactional
    public SubmissionDetailResponse getDetail(UUID submissionId) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        List<SubmissionQuestionDTO> questionDTOs =
                submission.getSubmissionQuestions()
                        .stream()
                        .sorted(Comparator.comparing(SubmissionQuestion::getOrderIndex))
                        .map(sq -> {

                            List<QuestionOptionDTO> optionDTOs =
                                    sq.getOriginalQuestion()
                                            .getOptions()
                                            .stream()
                                            .sorted(Comparator.comparing(QuestionOption::getOrderIndex))
                                            .map(opt -> QuestionOptionDTO.builder()
                                                    .id(opt.getId())
                                                    .content(opt.getContent())
                                                    .orderIndex(opt.getOrderIndex())
                                                    .build())
                                            .toList();

                            return SubmissionQuestionDTO.builder()
                                    .id(sq.getId())
                                    .content(sq.getContent())
                                    .questionType(sq.getQuestionType().name())
                                    .maxScore(sq.getMaxScore())
                                    .orderIndex(sq.getOrderIndex())
                                    .options(optionDTOs)
                                    .build();
                        }).toList();

        return SubmissionDetailResponse.builder()
                .submissionId(submission.getId())
                .assessmentTitle(submission.getAssessment().getTitle())
                .timeLimitMinutes(submission.getAssessment().getTimeLimitMinutes())
                .startedAt(submission.getStartedAt())
                .questions(questionDTOs)
                .build();
    }
}
