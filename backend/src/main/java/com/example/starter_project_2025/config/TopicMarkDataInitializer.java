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
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity.TopicAssessmentTypeWeight;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkColumn;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntry;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkColumnRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkEntryRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkRepository;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;

    //  Entry point 

    @Override
    @Transactional
    public void run(String... args) {
        initialize();
    }

    private void initialize() {
        List<CourseClass> allCourseClasses = courseClassRepository.findAll();
        if (allCourseClasses.isEmpty()) {
            log.info("TopicMarkDataInitializer skipped: no course classes found");
            return;
        }

        // Pick one CourseClass per training program (active first, then newest)
        List<CourseClass> targets = pickOnePerTrainingProgram(allCourseClasses);
        if (targets.isEmpty()) {
            log.info("TopicMarkDataInitializer skipped: no course classes linked to a training program");
            return;
        }

        User admin = resolveAdminUser();
        if (admin == null) {
            log.warn("TopicMarkDataInitializer skipped: no active user found");
            return;
        }

        // Ensure shared assessment types exist once
        AssessmentType quizType    = findOrCreateAssessmentType("Entrance Quiz",  "Short entry quizzes");
        AssessmentType midtermType = findOrCreateAssessmentType("Midterm Test",   "Comprehensive midterm exam");
        AssessmentType finalType   = findOrCreateAssessmentType("Final Exam",     "End-of-course final exam");

        int createdColumns = 0, createdTopics = 0, createdWeights = 0;
        int createdTopicMarks = 0, createdEntries = 0, createdEnrollments = 0;
        int updatedFinalScores = 0, activatedClasses = 0;

        for (CourseClass cc : targets) {

            // Ensure the training class is active
            if (!Boolean.TRUE.equals(cc.getClassInfo().getIsActive())) {
                cc.getClassInfo().setIsActive(true);
                trainingClassRepository.save(cc.getClassInfo());
                activatedClasses++;
            }

            // Ensure the course has a topic attached
            if (ensureCourseTopic(cc, admin)) {
                createdTopics++;
            }

            // Ensure grading columns exist
            List<TopicMarkColumn> columns = topicMarkColumnRepository.findActiveByCourseClassId(cc.getId());
            if (columns.isEmpty()) {
                createdColumns += createDefaultColumns(cc, admin, quizType, midtermType, finalType);
                columns = topicMarkColumnRepository.findActiveByCourseClassId(cc.getId());
            }

            // Ensure topic assessment weights exist
            createdWeights += ensureTopicWeights(cc, columns);

            // Resolve enrolled students (seed demo students if empty)
            List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(cc.getClassInfo().getId());
            if (enrollments.isEmpty()) {
                createdEnrollments += seedDemoEnrollments(cc.getClassInfo()).size();
                enrollments = enrollmentRepository.findByTrainingClassId(cc.getClassInfo().getId());
            }
            if (enrollments.isEmpty()) {
                continue;
            }

            //  Per-student seeding 
            UUID tpId = cc.getClassInfo().getTrainingProgram().getId();
            TrainingProgramTopic tpt = resolveTrainingProgramTopic(cc);

            for (Enrollment enrollment : enrollments) {
                User student = enrollment.getUser();

                // Ensure TopicMark record
                boolean alreadyHasMark = topicMarkRepository
                        .findByTrainingProgramTopicTrainingProgramIdAndUserId(tpId, student.getId())
                        .isPresent();

                if (!alreadyHasMark && tpt != null) {
                    topicMarkRepository.save(TopicMark.builder()
                            .trainingProgramTopic(tpt)
                            .user(student)
                            .topicId(resolveTopicId(cc))
                            .finalScore(null)
                            .isPassed(false)
                            .build());
                    createdTopicMarks++;
                }

                // Ensure TopicMarkEntry per column
                for (TopicMarkColumn column : columns) {
                    Optional<TopicMarkEntry> existing =
                            topicMarkEntryRepository.findByTopicMarkColumnIdAndUserId(column.getId(), student.getId());

                    if (existing.isEmpty()) {
                        topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                .topicMarkColumn(column)
                                .courseClass(cc)
                                .user(student)
                                .score(generateSeedScore(student, column))
                                .build());
                        createdEntries++;
                    } else if (existing.get().getScore() == null) {
                        existing.get().setScore(generateSeedScore(student, column));
                        topicMarkEntryRepository.save(existing.get());
                    }
                }

                // Recompute final score
                if (recomputeFinalScore(cc, student, tpt)) {
                    updatedFinalScores++;
                }
            }
        }

        log.info("TopicMarkDataInitializer done  columns={} topics={} weights={} marks={} entries={} finalScores={} enrollments={} activatedClasses={}",
                createdColumns, createdTopics, createdWeights, createdTopicMarks,
                createdEntries, updatedFinalScores, createdEnrollments, activatedClasses);
    }

    //  Helpers: resolution 

    /**
     * For each training program, pick the single best CourseClass:
     * active first, then most recently updated/created.
     */
    private List<CourseClass> pickOnePerTrainingProgram(List<CourseClass> all) {
        return all.stream()
                .filter(cc -> cc.getClassInfo() != null)
                .filter(cc -> cc.getClassInfo().getTrainingProgram() != null)
                .collect(Collectors.groupingBy(cc -> cc.getClassInfo().getTrainingProgram().getId()))
                .values().stream()
                .map(group -> group.stream()
                        .sorted(Comparator
                                .comparing((CourseClass cc) -> Boolean.TRUE.equals(cc.getClassInfo().getIsActive()))
                                .reversed()
                                .thenComparing(CourseClass::getUpdatedDate, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(CourseClass::getCreatedDate, Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(CourseClass::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                        .findFirst()
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    private User resolveAdminUser() {
        return userRepository.findByEmail("admin@example.com")
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                        .findFirst()
                        .orElse(null));
    }

    private UUID resolveTopicId(CourseClass cc) {
        if (cc == null || cc.getCourse() == null || cc.getCourse().getTopic() == null) {
            return null;
        }
        return cc.getCourse().getTopic().getId();
    }

    private TrainingProgramTopic resolveTrainingProgramTopic(CourseClass cc) {
        if (cc.getClassInfo() == null || cc.getClassInfo().getTrainingProgram() == null) {
            return null;
        }
        UUID tpId    = cc.getClassInfo().getTrainingProgram().getId();
        UUID topicId = resolveTopicId(cc);
        if (topicId != null) {
            return trainingProgramTopicRepository
                    .findByTrainingProgram_IdAndTopic_Id(tpId, topicId)
                    .orElseGet(() -> trainingProgramTopicRepository
                            .findFirstByTrainingProgram_Id(tpId).orElse(null));
        }
        return trainingProgramTopicRepository.findFirstByTrainingProgram_Id(tpId).orElse(null);
    }

    //  Helpers: seeding 

    /** Auto-create a Topic for the course if it does not already have one. */
    private boolean ensureCourseTopic(CourseClass cc, User admin) {
        if (cc.getCourse() == null || cc.getCourse().getTopic() != null) {
            return false;
        }
        Course course = cc.getCourse();

        String sanitized = course.getCourseCode() == null ? "AUTO"
                : course.getCourseCode().replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
        if (sanitized.isBlank()) sanitized = "AUTO";

        String base = "AUTO-" + sanitized;
        String code = base;
        for (int i = 1; topicRepository.existsByTopicCode(code); i++) {
            code = base + "-" + i;
        }

        Topic topic = topicRepository.save(Topic.builder()
                .topicName((course.getCourseName() != null ? course.getCourseName() : "Course") + " Topic")
                .topicCode(code)
                .level(TopicLevel.BEGINNER)
                .status(TopicStatus.ACTIVE)
                .description("Auto-created by TopicMarkDataInitializer")
                .creator(admin)
                .updater(admin)
                .build());

        course.setTopic(topic);
        courseRepository.save(course);
        return true;
    }

    private AssessmentType findOrCreateAssessmentType(String name, String description) {
        return assessmentTypeRepository.findByName(name)
                .orElseGet(() -> {
                    AssessmentType t = new AssessmentType();
                    t.setName(name);
                    t.setDescription(description);
                    return assessmentTypeRepository.save(t);
                });
    }

    private int createDefaultColumns(CourseClass cc, User admin,
            AssessmentType quizType, AssessmentType midtermType, AssessmentType finalType) {
        topicMarkColumnRepository.saveAll(List.of(
                buildColumn(cc, quizType,    "Quiz Chapter 1", 1, admin),
                buildColumn(cc, quizType,    "Quiz Chapter 2", 2, admin),
                buildColumn(cc, midtermType, "Midterm Exam",   1, admin),
                buildColumn(cc, finalType,   "Final Exam",     1, admin)
        ));
        return 4;
    }

    private TopicMarkColumn buildColumn(CourseClass cc, AssessmentType type,
            String label, int index, User admin) {
        return TopicMarkColumn.builder()
                .courseClass(cc)
                .assessmentType(type)
                .columnLabel(label)
                .columnIndex(index)
                .isDeleted(false)
                .createdBy(admin)
                .build();
    }

    /** Seed default weights per assessment type if none exist for the topic. */
    private int ensureTopicWeights(CourseClass cc, List<TopicMarkColumn> columns) {
        UUID topicId = resolveTopicId(cc);
        if (topicId == null || columns.isEmpty()) return 0;
        if (!topicAssessmentTypeWeightRepository.findByTopicId(topicId).isEmpty()) return 0;

        Map<String, AssessmentType> byType = new LinkedHashMap<>();
        columns.forEach(col -> {
            if (col.getAssessmentType() != null) {
                byType.putIfAbsent(col.getAssessmentType().getId(), col.getAssessmentType());
            }
        });
        if (byType.isEmpty()) return 0;

        List<TopicAssessmentTypeWeight> weights = byType.values().stream()
                .map(at -> TopicAssessmentTypeWeight.builder()
                        .topic(cc.getCourse().getTopic())
                        .assessmentType(at)
                        .weight(defaultWeight(at.getName()))
                        .build())
                .collect(Collectors.toList());

        topicAssessmentTypeWeightRepository.saveAll(weights);
        return weights.size();
    }

    private double defaultWeight(String name) {
        if (name == null) return 34.0;
        String lower = name.toLowerCase();
        if (lower.contains("final")) return 50.0;
        if (lower.contains("mid"))   return 30.0;
        if (lower.contains("quiz"))  return 20.0;
        return 34.0;
    }

    private List<Enrollment> seedDemoEnrollments(TrainingClass tc) {
        List<String> emails = List.of(
                "student1@example.com", "student2@example.com", "student3@example.com",
                "student4@example.com", "student5@example.com");

        List<Enrollment> created = new ArrayList<>();
        for (String email : emails) {
            userRepository.findByEmail(email).ifPresent(student -> {
                if (!enrollmentRepository.existsByUserIdAndTrainingClassId(student.getId(), tc.getId())) {
                    created.add(enrollmentRepository.save(Enrollment.builder()
                            .user(student)
                            .trainingClass(tc)
                            .build()));
                }
            });
        }
        return created;
    }

    private Double generateSeedScore(User student, TopicMarkColumn column) {
        int base = Math.abs((student.getEmail() + column.getColumnLabel()).hashCode());
        double raw = 5.0 + (base % 50) / 10.0; // range 5.0  9.9
        return Math.round(raw * 10.0) / 10.0;
    }

    //  Final-score computation 

    /**
     * Recompute and persist the final score for {@code student} in {@code cc}.
     * Returns {@code true} if the stored value actually changed.
     */
    private boolean recomputeFinalScore(CourseClass cc, User student, TrainingProgramTopic tpt) {
        UUID tpId = cc.getClassInfo().getTrainingProgram().getId();

        TopicMark mark = topicMarkRepository
                .findByTrainingProgramTopicTrainingProgramIdAndUserId(tpId, student.getId())
                .orElseGet(() -> {
                    if (tpt == null) return null;
                    return topicMarkRepository.save(TopicMark.builder()
                            .trainingProgramTopic(tpt)
                            .user(student)
                            .topicId(resolveTopicId(cc))
                            .isPassed(false)
                            .build());
                });

        if (mark == null) return false;

        // Collect non-deleted entries for this student / course class
        List<TopicMarkEntry> entries = topicMarkEntryRepository
                .findByCourseClassIdAndUserId(cc.getId(), student.getId())
                .stream()
                .filter(e -> e.getTopicMarkColumn() != null
                        && !Boolean.TRUE.equals(e.getTopicMarkColumn().getIsDeleted()))
                .sorted(Comparator
                        .comparing((TopicMarkEntry e) -> e.getTopicMarkColumn().getAssessmentType().getName())
                        .thenComparingInt(e -> e.getTopicMarkColumn().getColumnIndex()))
                .collect(Collectors.toList());

        UUID topicId = resolveTopicId(cc);

        // If any score is missing, clear the final score
        if (entries.isEmpty() || entries.stream().anyMatch(e -> e.getScore() == null) || topicId == null) {
            return persistMark(mark, null, false, topicId);
        }

        // Load weights
        Map<String, Double> weightById = topicAssessmentTypeWeightRepository.findByTopicId(topicId)
                .stream()
                .filter(w -> w.getAssessmentType() != null && w.getWeight() != null)
                .collect(Collectors.toMap(
                        w -> w.getAssessmentType().getId(),
                        w -> w.getWeight(),
                        (a, b) -> a));

        if (weightById.isEmpty()) {
            return persistMark(mark, null, false, topicId);
        }

        // Check every used assessment type has a weight
        boolean missingWeight = entries.stream()
                .map(e -> e.getTopicMarkColumn().getAssessmentType().getId())
                .distinct()
                .anyMatch(id -> !weightById.containsKey(id));
        if (missingWeight) {
            return persistMark(mark, null, false, topicId);
        }

        // Weighted average: weight is per assessment-type, spread evenly across columns of that type
        Map<String, Long> countByType = entries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getTopicMarkColumn().getAssessmentType().getId(),
                        Collectors.counting()));

        double raw = 0.0;
        for (TopicMarkEntry e : entries) {
            String typeId = e.getTopicMarkColumn().getAssessmentType().getId();
            double factor = (weightById.get(typeId) / 100.0) / countByType.get(typeId);
            raw += e.getScore() * factor;
        }

        double finalScore = Math.round(raw * 100.0) / 100.0;
        double minGpa = cc.getCourse() != null && cc.getCourse().getMinGpaToPass() != null
                ? cc.getCourse().getMinGpaToPass() : 5.0;
        boolean passed = finalScore >= minGpa;

        return persistMark(mark, finalScore, passed, topicId);
    }

    /** Saves the mark and returns true if values actually changed. */
    private boolean persistMark(TopicMark mark, Double finalScore, boolean passed, UUID topicId) {
        boolean changed = !Objects.equals(mark.getFinalScore(), finalScore)
                || !Objects.equals(mark.getIsPassed(), passed)
                || !Objects.equals(mark.getTopicId(), topicId);
        if (changed) {
            mark.setFinalScore(finalScore);
            mark.setIsPassed(passed);
            mark.setTopicId(topicId);
            topicMarkRepository.save(mark);
        }
        return changed;
    }
}