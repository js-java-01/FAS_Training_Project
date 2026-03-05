package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
<<<<<<< HEAD
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
=======
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseLevelOnline;
import com.example.starter_project_2025.system.course_online.enums.CourseStatusOnline;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
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

<<<<<<< HEAD
=======
/**
 * Seed demo data for the manual-entry Topic Mark system.
 *
 * Structure created:
 * Course DEMO-COURSE-TM (minGpaToPass = 6.0, scale 0-10)
 * CourseAssessmentTypeWeight Entrance Quiz 30% HIGHEST
 * Midterm Test 50% LATEST
 * Final Exam 20% AVERAGE
 * TrainingClass TC-DEMO-01 (Course x TC-DEMO-01, scores seeded)
 * TrainingClass TC-DEMO-02 (JBM-01 + RFP-01, no scores)
 * TrainingClass TC-DEMO-03 (JBM-01 + DEMO-COURSE-TM, no scores)
 * TrainingClass TC-DEMO-04 (DEMO-COURSE-TM, scores seeded)
 * Students: john, alice, bob, carol, david, eva (enrolled in TC-DEMO-01 &
 * TC-DEMO-04)
 * TopicMarkColumns (4 per scored class: Quiz Ch1, Quiz Ch2, Midterm, Final)
 * TopicMarkEntries (all filled for TC-DEMO-01 and TC-DEMO-04)
 * TopicMarkEntryHistory (one audit record per entry)
 * TopicMark (finalScore computed, pass/fail set)
 *
 * TC-DEMO-01 results: John 7.90 PASS | Alice 8.15 PASS | Bob 4.80 FAIL | Carol
 * 9.39 PASS | David 5.83 FAIL | Eva 8.12 PASS
 * TC-DEMO-04 results: John 8.05 PASS | Alice 9.06 PASS | Bob 4.60 FAIL | Carol
 * 9.40 PASS | David 5.80 FAIL | Eva 8.61 PASS
 */
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TopicMarkDataInitializer implements CommandLineRunner {

<<<<<<< HEAD
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
=======
    @PersistenceContext
    private EntityManager em;

    @Lazy
    @Autowired
    private TopicMarkDataInitializer self;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseOnlineRepository courseOnlineRepository;
    private final CourseAssessmentTypeWeightRepository weightRepository;
    private final TopicMarkColumnRepository columnRepository;
    private final TopicMarkEntryRepository entryRepository;
    private final TopicMarkEntryHistoryRepository historyRepository;
    private final TopicMarkRepository topicMarkRepository;

    // Entry point
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

    @Override
    @Transactional
    public void run(String... args) {
        initialize();
    }

<<<<<<< HEAD
    private void initialize() {
        List<CourseClass> courseClasses = courseClassRepository.findAll();
        if (courseClasses.isEmpty()) {
            log.info("TopicMarkDataInitializer skipped: no course classes found");
            return;
        }
=======
    @Transactional
    public void initialize() {
        log.info("=== TopicMarkDataInitializer: starting ===");

        // 1. Shared infrastructure
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

        User createdBy = userRepository.findByEmail("admin@example.com")
                .orElseGet(() -> userRepository.findAll().stream()
                        .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                        .findFirst()
                        .orElse(null));

<<<<<<< HEAD
        if (createdBy == null) {
            log.warn("TopicMarkDataInitializer skipped: no active user found");
=======
        if (admin == null) {
            log.warn(
                    "No active user found - TopicMark seed skipped. Will seed on next restart after UserDataInitializer runs.");
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
            return;
        }

        AssessmentType quizType = findOrCreateAssessmentType("Entrance Quiz", "Short entry quizzes");
        AssessmentType midtermType = findOrCreateAssessmentType("Midterm Test", "Comprehensive midterm exam");
        AssessmentType finalType = findOrCreateAssessmentType("Final Exam", "End-of-course final exam");
<<<<<<< HEAD

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
=======

        CourseOnline course = findOrCreateCourse(admin);

        findOrCreateWeight(course, quizType, 0.30, GradingMethod.HIGHEST);
        findOrCreateWeight(course, midtermType, 0.50, GradingMethod.LATEST);
        findOrCreateWeight(course, finalType, 0.20, GradingMethod.AVERAGE);
        log.info("Weights: Quiz 30% HIGHEST | Midterm 50% LATEST | Final 20% AVERAGE");

        Semester semester = findOrCreateSemester();
        TrainingClass trainingClass = findOrCreateTrainingClass(semester, admin);
        CourseClass courseClass = findOrCreateCourseClass(course, trainingClass);

        // Extra classes: TC-DEMO-02 and TC-DEMO-03, each linked to 2 courses
        CourseOnline javaCourse = findCourseByCode("JBM-01");
        CourseOnline reactCourse = findCourseByCode("RFP-01");

        TrainingClass tc02 = findOrCreateTrainingClassByCode("TC-DEMO-02", "Demo Training Class 02", semester, admin);
        if (javaCourse != null)
            findOrCreateCourseClass(javaCourse, tc02);
        if (reactCourse != null)
            findOrCreateCourseClass(reactCourse, tc02);

        TrainingClass tc03 = findOrCreateTrainingClassByCode("TC-DEMO-03", "Demo Training Class 03", semester, admin);
        if (javaCourse != null)
            findOrCreateCourseClass(javaCourse, tc03);
        findOrCreateCourseClass(course, tc03); // DEMO-COURSE-TM
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

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

<<<<<<< HEAD
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
=======
        // 2. Students + enrollments

        User john = findOrCreateStudent("student@test.com", "John", "Doe");
        User alice = findOrCreateStudent("alice.johnson@test.com", "Alice", "Johnson");
        User bob = findOrCreateStudent("bob.wilson@test.com", "Bob", "Wilson");
        User carol = findOrCreateStudent("carol.davis@test.com", "Carol", "Davis");
        User david = findOrCreateStudent("david.lee@test.com", "David", "Lee");
        User eva = findOrCreateStudent("eva.chen@test.com", "Eva", "Chen");
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

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
<<<<<<< HEAD

        List<TopicAssessmentTypeWeight> existingWeights = topicAssessmentTypeWeightRepository.findByTopicId(topicId);
        if (!existingWeights.isEmpty()) {
            return 0;
        }

        Map<String, AssessmentType> assessmentTypeMap = new LinkedHashMap<>();
        for (TopicMarkColumn column : activeColumns) {
            if (column.getAssessmentType() != null) {
                assessmentTypeMap.putIfAbsent(column.getAssessmentType().getId(), column.getAssessmentType());
            }
=======
        log.info("6 students enrolled in TC-DEMO-01 and TC-DEMO-04");

        double minGpa = course.getMinGpaToPass() != null ? course.getMinGpaToPass() : 6.0;
        record SD(User user, double q1, double q2, double mid, double fin, double total) {
        }

        // 3. Seed TC-DEMO-01 (guard: skip if columns already exist)
        // John: Quiz[8.0,9.0] HIGHEST=9.0 *0.30=2.70 | Mid 7.0 *0.50=3.50 | Final 8.50
        // *0.20=1.70 => 7.90 PASS
        // Alice: Quiz[8.0,8.5] HIGHEST=8.5 *0.30=2.55 | Mid 8.2 *0.50=4.10 | Final 7.50
        // *0.20=1.50 => 8.15 PASS
        // Bob: Quiz[5.5,4.8] HIGHEST=5.5 *0.30=1.65 | Mid 4.0 *0.50=2.00 | Final 5.75
        // *0.20=1.15 => 4.80 FAIL
        // Carol: Quiz[9.5,9.8] HIGHEST=9.8 *0.30=2.94 | Mid 9.2 *0.50=4.60 | Final 9.25
        // *0.20=1.85 => 9.39 PASS
        // David: Quiz[6.2,5.5] HIGHEST=6.2 *0.30=1.86 | Mid 5.5 *0.50=2.75 | Final 6.10
        // *0.20=1.22 => 5.83 FAIL
        // Eva: Quiz[8.5,8.8] HIGHEST=8.8 *0.30=2.64 | Mid 7.6 *0.50=3.80 | Final 8.40
        // *0.20=1.68 => 8.12 PASS

        if (columnRepository.findActiveByCourseClassId(courseClass.getId()).isEmpty()) {
            TopicMarkColumn quizCol1 = createColumn(courseClass, quizType, "Quiz Chapter 1", 1, admin);
            TopicMarkColumn quizCol2 = createColumn(courseClass, quizType, "Quiz Chapter 2", 2, admin);
            TopicMarkColumn midtermCol = createColumn(courseClass, midtermType, "Midterm Exam", 1, admin);
            TopicMarkColumn finalCol = createColumn(courseClass, finalType, "Final Exam", 1, admin);

            List.of(
                    new SD(john, 8.0, 9.0, 7.0, 8.50, 7.90),
                    new SD(alice, 8.0, 8.5, 8.2, 7.50, 8.15),
                    new SD(bob, 5.5, 4.8, 4.0, 5.75, 4.80),
                    new SD(carol, 9.5, 9.8, 9.2, 9.25, 9.39),
                    new SD(david, 6.2, 5.5, 5.5, 6.10, 5.83),
                    new SD(eva, 8.5, 8.8, 7.6, 8.40, 8.12)).forEach(sd -> {
                        saveEntry(quizCol1, sd.user(), sd.q1(), admin);
                        saveEntry(quizCol2, sd.user(), sd.q2(), admin);
                        saveEntry(midtermCol, sd.user(), sd.mid(), admin);
                        saveEntry(finalCol, sd.user(), sd.fin(), admin);
                        upsertTopicMark(courseClass, sd.user(), sd.total(), minGpa);
                    });
            log.info(
                    "TC-DEMO-01 seeded: John 7.90 PASS | Alice 8.15 PASS | Bob 4.80 FAIL | Carol 9.39 PASS | David 5.83 FAIL | Eva 8.12 PASS");
        } else {
            log.info("TC-DEMO-01 columns already exist - skipped");
        }

        // 4. Seed TC-DEMO-04 (guard: skip if columns already exist)
        // John: Quiz[7.5,8.0] HIGHEST=8.0 *0.30=2.40 | Mid 8.5 *0.50=4.25 | Final 7.0
        // *0.20=1.40 => 8.05 PASS
        // Alice: Quiz[9.0,9.2] HIGHEST=9.2 *0.30=2.76 | Mid 8.8 *0.50=4.40 | Final 9.5
        // *0.20=1.90 => 9.06 PASS
        // Bob: Quiz[3.5,4.0] HIGHEST=4.0 *0.30=1.20 | Mid 5.0 *0.50=2.50 | Final 4.5
        // *0.20=0.90 => 4.60 FAIL
        // Carol: Quiz[9.8,9.5] HIGHEST=9.8 *0.30=2.94 | Mid 9.0 *0.50=4.50 | Final 9.8
        // *0.20=1.96 => 9.40 PASS
        // David: Quiz[5.0,6.0] HIGHEST=6.0 *0.30=1.80 | Mid 5.8 *0.50=2.90 | Final 5.5
        // *0.20=1.10 => 5.80 FAIL
        // Eva: Quiz[8.0,8.5] HIGHEST=8.5 *0.30=2.55 | Mid 9.0 *0.50=4.50 | Final 7.8
        // *0.20=1.56 => 8.61 PASS

        if (columnRepository.findActiveByCourseClassId(courseClass04.getId()).isEmpty()) {
            TopicMarkColumn q1c4 = createColumn(courseClass04, quizType, "Quiz Chapter 1", 1, admin);
            TopicMarkColumn q2c4 = createColumn(courseClass04, quizType, "Quiz Chapter 2", 2, admin);
            TopicMarkColumn midc4 = createColumn(courseClass04, midtermType, "Midterm Exam", 1, admin);
            TopicMarkColumn finc4 = createColumn(courseClass04, finalType, "Final Exam", 1, admin);

            List.of(
                    new SD(john, 7.5, 8.0, 8.5, 7.0, 8.05),
                    new SD(alice, 9.0, 9.2, 8.8, 9.5, 9.06),
                    new SD(bob, 3.5, 4.0, 5.0, 4.5, 4.60),
                    new SD(carol, 9.8, 9.5, 9.0, 9.8, 9.40),
                    new SD(david, 5.0, 6.0, 5.8, 5.5, 5.80),
                    new SD(eva, 8.0, 8.5, 9.0, 7.8, 8.61)).forEach(sd -> {
                        saveEntry(q1c4, sd.user(), sd.q1(), admin);
                        saveEntry(q2c4, sd.user(), sd.q2(), admin);
                        saveEntry(midc4, sd.user(), sd.mid(), admin);
                        saveEntry(finc4, sd.user(), sd.fin(), admin);
                        upsertTopicMark(courseClass04, sd.user(), sd.total(), minGpa);
                    });
            log.info(
                    "TC-DEMO-04 seeded: John 8.05 PASS | Alice 9.06 PASS | Bob 4.60 FAIL | Carol 9.40 PASS | David 5.80 FAIL | Eva 8.61 PASS");
        } else {
            log.info("TC-DEMO-04 columns already exist - skipped");
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
        }

        if (assessmentTypeMap.isEmpty()) {
            return 0;
        }

<<<<<<< HEAD
        List<TopicAssessmentTypeWeight> toCreate = new ArrayList<>();
        for (AssessmentType assessmentType : assessmentTypeMap.values()) {
            toCreate.add(TopicAssessmentTypeWeight.builder()
                    .topic(courseClass.getCourse().getTopic())
                    .assessmentType(assessmentType)
                    .weight(defaultWeightForAssessmentType(assessmentTypeMap.size(), assessmentType.getName()))
                    .build());
        }
=======
    // Helpers
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

        topicAssessmentTypeWeightRepository.saveAll(toCreate);
        return toCreate.size();
    }

<<<<<<< HEAD
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
=======
    private CourseOnline findOrCreateCourse(User admin) {
        return em.createQuery("SELECT c FROM CourseOnline c WHERE c.courseCode = :code", CourseOnline.class)
                .setParameter("code", "DEMO-COURSE-TM")
                .getResultStream().findFirst()
                .orElseGet(() -> courseOnlineRepository.save(CourseOnline.builder()
                        .courseName("Demo Course for Topic Marks")
                        .courseCode("DEMO-COURSE-TM")
                        .level(CourseLevelOnline.BEGINNER)
                        .estimatedTime(30 * 24 * 60)
                        .thumbnailUrl("https://example.com/demo-tm.jpg")
                        .status(CourseStatusOnline.ACTIVE)
                        .description("Demo course for testing manual Topic Mark entry")
                        .note("Seed data")
                        .minGpaToPass(6.0)
                        .minAttendancePercent(70.0)
                        .allowFinalRetake(true)
                        .creator(admin)
                        .build()));
    }

    private void findOrCreateWeight(CourseOnline course, AssessmentType type, double weight, GradingMethod gm) {
        Long count = em.createQuery(
                "SELECT COUNT(w) FROM CourseAssessmentTypeWeight w WHERE w.course.id = :c AND w.assessmentType.id = :t",
                Long.class)
                .setParameter("c", course.getId())
                .setParameter("t", type.getId())
                .getSingleResult();
        if (count == 0) {
            CourseAssessmentTypeWeight w = new CourseAssessmentTypeWeight();
            w.setCourse(course);
            w.setAssessmentType(type);
            w.setWeight(weight);
            w.setGradingMethod(gm);
            weightRepository.save(w);
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
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

<<<<<<< HEAD
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
=======
    private CourseOnline findCourseByCode(String code) {
        return em.createQuery("SELECT c FROM CourseOnline c WHERE c.courseCode = :code", CourseOnline.class)
                .setParameter("code", code)
                .getResultStream().findFirst()
                .orElse(null);
    }

    private CourseClass findOrCreateCourseClass(CourseOnline course, TrainingClass tc) {
        return em.createQuery(
                "SELECT cc FROM CourseClass cc WHERE cc.course.id = :c AND cc.classInfo.id = :t", CourseClass.class)
                .setParameter("c", course.getId())
                .setParameter("t", tc.getId())
                .getResultStream().findFirst()
                .orElseGet(() -> {
                    CourseClass cc = new CourseClass();
                    cc.setCourse(course);
                    cc.setClassInfo(tc);
                    em.persist(cc);
                    return cc;
                });
    }
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

        return created;
    }

<<<<<<< HEAD
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
=======
    private void findOrCreateEnrollment(User user, CourseOnline course) {
        Long count = em.createQuery(
                "SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :u AND e.course.id = :c", Long.class)
                .setParameter("u", user.getId())
                .setParameter("c", course.getId())
                .getSingleResult();
        if (count == 0) {
            Enrollment e = new Enrollment();
            e.setUser(user);
            e.setCourse(course);
            e.setStatus(EnrollmentStatus.ACTIVE);
            em.persist(e);
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2
        }

<<<<<<< HEAD
        UUID topicId = resolveTopicId(courseClass);
        if (topicId == null) {
            topicMark.setFinalScore(null);
            topicMark.setIsPassed(false);
            topicMark.setTopicId(null);
            topicMarkRepository.save(topicMark);
            return true;
        }
=======
    private TopicMarkColumn createColumn(CourseClass courseClass, AssessmentType type,
            String label, int index, User createdBy) {
        return columnRepository.save(TopicMarkColumn.builder()
                .courseClass(courseClass)
                .assessmentType(type)
                .columnLabel(label)
                .columnIndex(index)
                .isDeleted(false)
                .createdBy(createdBy)
                .build());
    }
>>>>>>> 2d1d754b083b3cd60d3e15a24a80dca5410433a2

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
