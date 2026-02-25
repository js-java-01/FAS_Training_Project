package com.example.starter_project_2025.system.topic_mark.service.impl;

import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.enums.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.repository.SubmissionRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.topic_mark.dto.TopicMarkGradebookResponse;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkRepository;
import com.example.starter_project_2025.system.topic_mark.service.TopicMarkService;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TopicMarkServiceImpl implements TopicMarkService {

    private final TopicMarkRepository topicMarkRepository;
    private final CourseClassRepository courseClassRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    public void recalculateForUser(UUID courseClassId, UUID userId) {
        log.debug("Recalculating topic mark for courseClass={}, user={}", courseClassId, userId);

        // 1. Load CourseClass and Course
        CourseClass courseClass = courseClassRepository.findById(courseClassId)
            .orElseThrow(() -> new ResourceNotFoundException("CourseClass not found: " + courseClassId));
        
        Course course = courseClass.getCourse();
        if (course == null) {
            throw new IllegalStateException("CourseClass has no associated Course");
        }

        // 2. Load assessment type weights for this course
        Set<CourseAssessmentTypeWeight> weights = course.getCourseAssessmentTypeWeights();
        if (weights == null || weights.isEmpty()) {
            log.warn("No assessment type weights configured for course {}", course.getId());
            upsertTopicMark(courseClass, userId, 0.0, false, null);
            return;
        }

        // Build map: assessmentTypeId -> weight
        Map<Long, Double> typeWeightMap = weights.stream()
            .collect(Collectors.toMap(
                w -> w.getAssessmentType().getId(),
                CourseAssessmentTypeWeight::getWeight,
                (a, b) -> a // handle duplicates
            ));

        // 3. Load all SUBMITTED submissions for this user in this course class
        List<Submission> submissions = submissionRepository.findAll().stream()
            .filter(s -> s.getCourseClass() != null 
                && s.getCourseClass().getId().equals(courseClassId)
                && s.getUser() != null
                && s.getUser().getId().equals(userId)
                && s.getStatus() == SubmissionStatus.SUBMITTED)
            .collect(Collectors.toList());

        log.debug("Found {} submitted submissions for user {} in courseClass {}", 
            submissions.size(), userId, courseClassId);

        // 4. Group submissions by AssessmentType
        Map<Long, List<Submission>> submissionsByType = submissions.stream()
            .filter(s -> s.getAssessment() != null && s.getAssessment().getAssessmentType() != null)
            .collect(Collectors.groupingBy(
                s -> s.getAssessment().getAssessmentType().getId()
            ));

        // 5. Calculate final score
        double finalScore = 0.0;

        for (Map.Entry<Long, Double> entry : typeWeightMap.entrySet()) {
            Long assessmentTypeId = entry.getKey();
            Double weight = entry.getValue();

            if (weight == null || weight == 0) {
                continue;
            }

            List<Submission> typeSubmissions = submissionsByType.getOrDefault(assessmentTypeId, Collections.emptyList());
            
            if (typeSubmissions.isEmpty()) {
                log.debug("No submissions for assessmentType {}, score=0", assessmentTypeId);
                continue;
            }

            // Group submissions by Assessment within this type
            Map<Long, List<Submission>> submissionsByAssessment = typeSubmissions.stream()
                .filter(s -> s.getAssessment() != null && s.getAssessment().getId() != null)
                .collect(Collectors.groupingBy(
                    s -> s.getAssessment().getId()
                ));

            // Calculate score for each assessment, then AVERAGE them
            List<Double> assessmentScores = new ArrayList<>();

            for (Map.Entry<Long, List<Submission>> assessmentEntry : submissionsByAssessment.entrySet()) {
                List<Submission> assessmentSubmissions = assessmentEntry.getValue();
                
                if (assessmentSubmissions.isEmpty()) {
                    continue;
                }

                Assessment assessment = assessmentSubmissions.get(0).getAssessment();
                GradingMethod gradingMethod = assessment.getGradingMethod();
                
                if (gradingMethod == null) {
                    gradingMethod = GradingMethod.HIGHEST;
                }

                double assessmentScore = computeAssessmentScore(assessmentSubmissions, gradingMethod);
                assessmentScores.add(assessmentScore);

                log.debug("Assessment {} ({}) score: {}", 
                    assessment.getId(), gradingMethod, assessmentScore);
            }

            // AVERAGE all assessment scores within the same type
            double typeScore = assessmentScores.isEmpty() 
                ? 0.0 
                : assessmentScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);

            double contribution = typeScore * weight;
            finalScore += contribution;

            log.debug("AssessmentType {} - typeScore: {}, weight: {}, contribution: {}", 
                assessmentTypeId, typeScore, weight, contribution);
        }

        // 6. Determine pass/fail
        Double minGpaToPass = course.getMinGpaToPass();
        boolean isPassed = minGpaToPass != null && finalScore >= minGpaToPass;

        log.debug("Final calculation - score: {}, minGpaToPass: {}, isPassed: {}", 
            finalScore, minGpaToPass, isPassed);

        // 7. Upsert topic mark
        upsertTopicMark(courseClass, userId, finalScore, isPassed, null);
    }

    /**
     * Compute score for a single assessment based on its grading method.
     */
    private double computeAssessmentScore(List<Submission> submissions, GradingMethod gradingMethod) {
        if (submissions.isEmpty()) {
            return 0.0;
        }

        switch (gradingMethod) {
            case HIGHEST:
                return submissions.stream()
                    .map(Submission::getTotalScore)
                    .filter(Objects::nonNull)
                    .max(Double::compare)
                    .orElse(0.0);

            case LATEST:
                return submissions.stream()
                    .max(Comparator.comparing(
                        s -> s.getSubmittedAt() != null ? s.getSubmittedAt() : LocalDateTime.MIN,
                        Comparator.naturalOrder()
                    ))
                    .map(Submission::getTotalScore)
                    .orElse(0.0);

            case AVERAGE:
                return submissions.stream()
                    .map(Submission::getTotalScore)
                    .filter(Objects::nonNull)
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);

            default:
                return 0.0;
        }
    }

    /**
     * Insert or update topic mark. Preserves existing comment if present.
     */
    private void upsertTopicMark(CourseClass courseClass, UUID userId, 
                                  Double finalScore, Boolean isPassed, String newComment) {
        Optional<TopicMark> existing = topicMarkRepository.findByCourseClassIdAndUserId(
            courseClass.getId(), userId
        );

        if (existing.isPresent()) {
            TopicMark mark = existing.get();
            mark.setFinalScore(finalScore != null ? finalScore : 0.0);
            mark.setIsPassed(isPassed != null ? isPassed : false);
            // Only update comment if explicitly provided (not from recalculation)
            if (newComment != null) {
                mark.setComment(newComment);
            }
            mark.setUpdatedAt(LocalDateTime.now());
            topicMarkRepository.save(mark);
            log.debug("Updated topic mark id={}", mark.getId());
        } else {
            TopicMark mark = TopicMark.builder()
                .courseClass(courseClass)
                .user(User.builder().id(userId).build()) // lightweight reference
                .finalScore(finalScore != null ? finalScore : 0.0)
                .isPassed(isPassed != null ? isPassed : false)
                .comment(newComment)
                .updatedAt(LocalDateTime.now())
                .build();
            topicMarkRepository.save(mark);
            log.debug("Created new topic mark id={}", mark.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TopicMarkGradebookResponse getGradebook(UUID courseClassId) {
        CourseClass courseClass = courseClassRepository.findById(courseClassId)
            .orElseThrow(() -> new ResourceNotFoundException("CourseClass not found: " + courseClassId));

        // Get all active enrollments for this class
        List<Enrollment> enrollments = enrollmentRepository.findAll().stream()
            .filter(e -> e.getTrainingClass() != null 
                && courseClass.getClassInfo() != null
                && e.getTrainingClass().getId().equals(courseClass.getClassInfo().getId())
                && e.getStatus() == EnrollmentStatus.ACTIVE)
            .collect(Collectors.toList());

        // Load all topic marks for this course class
        Map<UUID, TopicMark> marksByUserId = topicMarkRepository.findAllByCourseClassId(courseClassId)
            .stream()
            .collect(Collectors.toMap(
                m -> m.getUser().getId(),
                m -> m
            ));

        // Build column metadata (simple version: only final score, isPassed, comment)
        List<TopicMarkGradebookResponse.Column> columns = Arrays.asList(
            new TopicMarkGradebookResponse.Column("FINAL_SCORE", "Final Score", null),
            new TopicMarkGradebookResponse.Column("IS_PASSED", "Passed", null),
            new TopicMarkGradebookResponse.Column("COMMENT", "Comment", null)
        );

        // Build rows
        List<TopicMarkGradebookResponse.Row> rows = enrollments.stream()
            .map(enrollment -> {
                User user = enrollment.getUser();
                TopicMark mark = marksByUserId.get(user.getId());

                Map<String, Object> values = new HashMap<>();
                values.put("FINAL_SCORE", mark != null ? mark.getFinalScore() : 0.0);
                values.put("IS_PASSED", mark != null ? mark.getIsPassed() : false);
                values.put("COMMENT", mark != null ? mark.getComment() : null);

                return TopicMarkGradebookResponse.Row.builder()
                    .userId(user.getId())
                    .fullName(user.getFirstName() + " " + user.getLastName())
                    .values(values)
                    .build();
            })
            .collect(Collectors.toList());

        return TopicMarkGradebookResponse.builder()
            .columns(columns)
            .rows(rows)
            .build();
    }

    @Override
    public void updateComment(UUID courseClassId, UUID userId, String comment) {
        CourseClass courseClass = courseClassRepository.findById(courseClassId)
            .orElseThrow(() -> new ResourceNotFoundException("CourseClass not found: " + courseClassId));

        Optional<TopicMark> existing = topicMarkRepository.findByCourseClassIdAndUserId(courseClassId, userId);

        if (existing.isPresent()) {
            TopicMark mark = existing.get();
            mark.setComment(comment);
            mark.setUpdatedAt(LocalDateTime.now());
            topicMarkRepository.save(mark);
        } else {
            // Create new record with default values
            TopicMark mark = TopicMark.builder()
                .courseClass(courseClass)
                .user(User.builder().id(userId).build())
                .finalScore(0.0)
                .isPassed(false)
                .comment(comment)
                .updatedAt(LocalDateTime.now())
                .build();
            topicMarkRepository.save(mark);
        }
    }
}
