package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity.TopicAssessmentTypeWeight;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkColumn;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntry;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkColumnRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkEntryRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TopicMarkDataInitializer implements CommandLineRunner {

    private final CourseClassRepository courseClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final TopicMarkRepository topicMarkRepository;
    private final TopicMarkColumnRepository topicMarkColumnRepository;
    private final TopicMarkEntryRepository topicMarkEntryRepository;
    private final UserRepository userRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final TopicAssessmentTypeWeightRepository topicAssessmentTypeWeightRepository;
    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public void run(String... args) {
        initialize();
    }

    private void initialize() {
        List<CourseClass> courseClasses = courseClassRepository.findAll();
        if (courseClasses.isEmpty()) {
            log.info("TopicMarkDataInitializer skipped: no course classes found");
            return;
        }

        User createdBy = userRepository.findByEmail("admin@example.com")
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                        .findFirst()
                        .orElse(null));

        if (createdBy == null) {
            log.warn("TopicMarkDataInitializer skipped: no active user found");
            return;
        }

        AssessmentType quizType = findOrCreateAssessmentType("Entrance Quiz", "Short entry quizzes");
        AssessmentType midtermType = findOrCreateAssessmentType("Midterm Test", "Comprehensive midterm exam");
        AssessmentType finalType = findOrCreateAssessmentType("Final Exam", "End-of-course final exam");

        int createdColumns = 0;
        int createdTopics = 0;
        int createdWeights = 0;
        int createdTopicMarks = 0;
        int createdEntries = 0;
        int createdEnrollments = 0;
        int updatedFinalScores = 0;

        for (CourseClass courseClass : courseClasses) {
            if (ensureCourseTopic(courseClass, createdBy)) {
                createdTopics++;
            }

            List<TopicMarkColumn> activeColumns = topicMarkColumnRepository.findActiveByCourseClassId(courseClass.getId());
            if (activeColumns.isEmpty()) {
                createdColumns += createDefaultColumns(courseClass, createdBy, quizType, midtermType, finalType);
                activeColumns = topicMarkColumnRepository.findActiveByCourseClassId(courseClass.getId());
            }

            createdWeights += ensureTopicWeights(courseClass, activeColumns);

            List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(courseClass.getClassInfo().getId());
            if (enrollments.isEmpty()) {
                List<Enrollment> seededEnrollments = seedDemoEnrollments(courseClass.getClassInfo().getId());
                createdEnrollments += seededEnrollments.size();
                enrollments = enrollmentRepository.findByTrainingClassId(courseClass.getClassInfo().getId());
                if (enrollments.isEmpty()) {
                    continue;
                }
            }

            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();

                boolean topicMarkExists = topicMarkRepository
                        .findByCourseClassIdAndUserId(courseClass.getId(), student.getId())
                        .isPresent();

                if (!topicMarkExists) {
                    topicMarkRepository.save(TopicMark.builder()
                            .courseClass(courseClass)
                            .user(student)
                            .topicId(resolveTopicId(courseClass))
                            .finalScore(null)
                            .isPassed(false)
                            .build());
                    createdTopicMarks++;
                }

                for (TopicMarkColumn column : activeColumns) {
                    var existingEntry = topicMarkEntryRepository
                            .findByTopicMarkColumnIdAndUserId(column.getId(), student.getId());

                    Double seedScore = generateSeedScore(student, column);
                    if (existingEntry.isEmpty()) {
                        topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                .topicMarkColumn(column)
                                .courseClass(courseClass)
                                .user(student)
                                .score(seedScore)
                                .build());
                        createdEntries++;
                    } else if (existingEntry.get().getScore() == null) {
                        TopicMarkEntry entry = existingEntry.get();
                        entry.setScore(seedScore);
                        topicMarkEntryRepository.save(entry);
                    }
                }

                if (recomputeFinalScore(courseClass, student)) {
                    updatedFinalScores++;
                }
            }
        }

        log.info("TopicMarkDataInitializer completed: createdColumns={}, createdTopics={}, createdWeights={}, createdTopicMarks={}, createdEntries={}, updatedFinalScores={}",
                createdColumns, createdTopics, createdWeights, createdTopicMarks, createdEntries, updatedFinalScores);
        log.info("TopicMarkDataInitializer enrollments seeded: {}", createdEnrollments);
    }

    private boolean ensureCourseTopic(CourseClass courseClass, User createdBy) {
        if (courseClass == null || courseClass.getCourse() == null) {
            return false;
        }

        Course course = courseClass.getCourse();
        if (course.getTopic() != null) {
            return false;
        }

        String sanitizedCode = course.getCourseCode() == null
                ? "AUTO"
                : course.getCourseCode().replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        if (sanitizedCode.isBlank()) {
            sanitizedCode = "AUTO";
        }

        String baseTopicCode = "AUTO-" + sanitizedCode;
        String topicCode = baseTopicCode;
        int suffix = 1;
        while (topicRepository.existsByTopicCode(topicCode)) {
            topicCode = baseTopicCode + "-" + suffix;
            suffix++;
        }

        Topic topic = Topic.builder()
                .topicName((course.getCourseName() != null ? course.getCourseName() : "Course") + " Topic")
                .topicCode(topicCode)
                .status(TopicStatus.ACTIVE)
                .description("Auto-created by TopicMarkDataInitializer")
                .creator(createdBy)
                .updater(createdBy)
                .build();

        topic = topicRepository.save(topic);
        course.setTopic(topic);
        courseRepository.save(course);
        return true;
    }

    private AssessmentType findOrCreateAssessmentType(String name, String description) {
        return assessmentTypeRepository.findByName(name)
                .orElseGet(() -> {
                    AssessmentType type = new AssessmentType();
                    type.setName(name);
                    type.setDescription(description);
                    return assessmentTypeRepository.save(type);
                });
    }

    private int createDefaultColumns(
            CourseClass courseClass,
            User createdBy,
            AssessmentType quizType,
            AssessmentType midtermType,
            AssessmentType finalType
    ) {
        TopicMarkColumn quiz1 = TopicMarkColumn.builder()
                .courseClass(courseClass)
                .assessmentType(quizType)
                .columnLabel("Quiz Chapter 1")
                .columnIndex(1)
                .isDeleted(false)
                .createdBy(createdBy)
                .build();

        TopicMarkColumn quiz2 = TopicMarkColumn.builder()
                .courseClass(courseClass)
                .assessmentType(quizType)
                .columnLabel("Quiz Chapter 2")
                .columnIndex(2)
                .isDeleted(false)
                .createdBy(createdBy)
                .build();

        TopicMarkColumn midterm = TopicMarkColumn.builder()
                .courseClass(courseClass)
                .assessmentType(midtermType)
                .columnLabel("Midterm Exam")
                .columnIndex(1)
                .isDeleted(false)
                .createdBy(createdBy)
                .build();

        TopicMarkColumn finalExam = TopicMarkColumn.builder()
                .courseClass(courseClass)
                .assessmentType(finalType)
                .columnLabel("Final Exam")
                .columnIndex(1)
                .isDeleted(false)
                .createdBy(createdBy)
                .build();

        topicMarkColumnRepository.saveAll(List.of(quiz1, quiz2, midterm, finalExam));
        return 4;
    }

    private int ensureTopicWeights(CourseClass courseClass, List<TopicMarkColumn> activeColumns) {
        UUID topicId = resolveTopicId(courseClass);
        if (topicId == null || activeColumns == null || activeColumns.isEmpty()) {
            return 0;
        }

        List<TopicAssessmentTypeWeight> existingWeights = topicAssessmentTypeWeightRepository.findByTopicId(topicId);
        if (!existingWeights.isEmpty()) {
            return 0;
        }

        Map<String, AssessmentType> assessmentTypeMap = new LinkedHashMap<>();
        for (TopicMarkColumn column : activeColumns) {
            if (column.getAssessmentType() != null) {
                assessmentTypeMap.putIfAbsent(column.getAssessmentType().getId(), column.getAssessmentType());
            }
        }

        if (assessmentTypeMap.isEmpty()) {
            return 0;
        }

        List<TopicAssessmentTypeWeight> toCreate = new ArrayList<>();
        for (AssessmentType assessmentType : assessmentTypeMap.values()) {
            toCreate.add(TopicAssessmentTypeWeight.builder()
                    .topic(courseClass.getCourse().getTopic())
                    .assessmentType(assessmentType)
                    .weight(defaultWeightForAssessmentType(assessmentTypeMap.size(), assessmentType.getName()))
                    .build());
        }

        topicAssessmentTypeWeightRepository.saveAll(toCreate);
        return toCreate.size();
    }

    private double defaultWeightForAssessmentType(int typeCount, String assessmentTypeName) {
        if (assessmentTypeName == null) {
            return Math.round((100.0 / typeCount) * 100.0) / 100.0;
        }

        String lowered = assessmentTypeName.toLowerCase();
        if (lowered.contains("final")) {
            return 50.0;
        }
        if (lowered.contains("mid")) {
            return 30.0;
        }
        if (lowered.contains("quiz")) {
            return 20.0;
        }

        return Math.round((100.0 / typeCount) * 100.0) / 100.0;
    }

    private UUID resolveTopicId(CourseClass courseClass) {
        if (courseClass == null || courseClass.getCourse() == null || courseClass.getCourse().getTopic() == null) {
            return null;
        }
        return courseClass.getCourse().getTopic().getId();
    }

    private Double generateSeedScore(User student, TopicMarkColumn column) {
        int base = Math.abs((student.getEmail() + column.getColumnLabel()).hashCode());
        double raw = 5.0 + (base % 50) / 10.0; // 5.0 -> 9.9
        return Math.round(raw * 10.0) / 10.0;
    }

    private List<Enrollment> seedDemoEnrollments(UUID trainingClassId) {
        TrainingClass trainingClass = trainingClassRepository.findById(trainingClassId).orElse(null);
        if (trainingClass == null) {
            return List.of();
        }

        List<String> demoStudentEmails = List.of(
                "student1@example.com",
                "student2@example.com",
                "student3@example.com",
                "student4@example.com",
                "student5@example.com"
        );

        List<Enrollment> created = new ArrayList<>();
        for (String email : demoStudentEmails) {
            User student = userRepository.findByEmail(email).orElse(null);
            if (student == null) {
                continue;
            }

            boolean exists = enrollmentRepository.existsByUserIdAndTrainingClassId(student.getId(), trainingClassId);
            if (!exists) {
                Enrollment enrollment = Enrollment.builder()
                        .user(student)
                        .trainingClass(trainingClass)
                        .build();
                created.add(enrollmentRepository.save(enrollment));
            }
        }

        return created;
    }

    private boolean recomputeFinalScore(CourseClass courseClass, User student) {
        TopicMark topicMark = topicMarkRepository
            .findByCourseClassIdAndUserId(courseClass.getId(), student.getId())
            .orElseGet(() -> topicMarkRepository.save(TopicMark.builder()
                .courseClass(courseClass)
                .user(student)
                .topicId(resolveTopicId(courseClass))
                .isPassed(false)
                .build()));

        List<TopicMarkEntry> entries = topicMarkEntryRepository
            .findByCourseClassIdAndUserId(courseClass.getId(), student.getId())
            .stream()
            .filter(e -> e.getTopicMarkColumn() != null && !Boolean.TRUE.equals(e.getTopicMarkColumn().getIsDeleted()))
            .sorted(Comparator.comparing((TopicMarkEntry e) -> e.getTopicMarkColumn().getAssessmentType().getName())
                .thenComparing(e -> e.getTopicMarkColumn().getColumnIndex()))
            .toList();

        if (entries.isEmpty() || entries.stream().anyMatch(e -> e.getScore() == null)) {
            boolean changed = topicMark.getFinalScore() != null || Boolean.TRUE.equals(topicMark.getIsPassed());
            topicMark.setFinalScore(null);
            topicMark.setIsPassed(false);
            topicMark.setTopicId(resolveTopicId(courseClass));
            topicMarkRepository.save(topicMark);
            return changed;
        }

        UUID topicId = resolveTopicId(courseClass);
        if (topicId == null) {
            topicMark.setFinalScore(null);
            topicMark.setIsPassed(false);
            topicMark.setTopicId(null);
            topicMarkRepository.save(topicMark);
            return true;
        }

        var weightByAssessmentTypeId = topicAssessmentTypeWeightRepository.findByTopicId(topicId)
                .stream()
                .filter(w -> w.getAssessmentType() != null && w.getWeight() != null)
                .collect(java.util.stream.Collectors.toMap(
                        w -> w.getAssessmentType().getId(),
                        w -> w.getWeight(),
                        (left, right) -> right));

        if (weightByAssessmentTypeId.isEmpty()) {
            topicMark.setFinalScore(null);
            topicMark.setIsPassed(false);
            topicMark.setTopicId(topicId);
            topicMarkRepository.save(topicMark);
            return true;
        }

        var activeAssessmentTypeIds = entries.stream()
                .map(e -> e.getTopicMarkColumn().getAssessmentType().getId())
                .collect(java.util.stream.Collectors.toSet());

        boolean hasMissingWeight = activeAssessmentTypeIds.stream()
                .anyMatch(typeIdKey -> !weightByAssessmentTypeId.containsKey(typeIdKey));
        if (hasMissingWeight) {
            topicMark.setFinalScore(null);
            topicMark.setIsPassed(false);
            topicMark.setTopicId(topicId);
            topicMarkRepository.save(topicMark);
            return true;
        }

        var columnCountByType = entries.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getTopicMarkColumn().getAssessmentType().getId(),
                        java.util.stream.Collectors.counting()));

        var scoresByType = entries.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        e -> e.getTopicMarkColumn().getAssessmentType().getId(),
                        java.util.stream.Collectors.mapping(TopicMarkEntry::getScore, java.util.stream.Collectors.toList())));

        double weightedScore = 0.0;
        for (var scoreEntry : scoresByType.entrySet()) {
            Double typeWeight = weightByAssessmentTypeId.get(scoreEntry.getKey());
            if (typeWeight == null) {
                continue;
            }

            long columnCount = columnCountByType.getOrDefault(scoreEntry.getKey(), 0L);
            if (columnCount <= 0) {
                continue;
            }

            var sectionScores = scoreEntry.getValue();
            if (sectionScores.isEmpty()) {
                continue;
            }

            double columnWeightFactor = (typeWeight / 100.0) / columnCount;
            for (Double score : sectionScores) {
                weightedScore += score * columnWeightFactor;
            }
        }

        double roundedFinalScore = Math.round(weightedScore * 100.0) / 100.0;
        double minGpa = courseClass.getCourse() != null && courseClass.getCourse().getMinGpaToPass() != null
            ? courseClass.getCourse().getMinGpaToPass()
            : 5.0;

        boolean passed = roundedFinalScore >= minGpa;
        boolean changed = !Double.valueOf(roundedFinalScore).equals(topicMark.getFinalScore())
            || !Boolean.valueOf(passed).equals(topicMark.getIsPassed())
                || (topicMark.getTopicId() == null && resolveTopicId(courseClass) != null);

        topicMark.setFinalScore(roundedFinalScore);
        topicMark.setIsPassed(passed);
        topicMark.setTopicId(resolveTopicId(courseClass));
        topicMarkRepository.save(topicMark);

        return changed;
    }

}
