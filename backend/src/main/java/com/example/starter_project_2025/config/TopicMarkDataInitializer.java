package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.*;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.enums.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.repository.SubmissionRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TopicMarkDataInitializer implements CommandLineRunner {

    @PersistenceContext
    private EntityManager entityManager;

    // Self-injection to call through Spring proxy (enables @Transactional)
    @Lazy
    @Autowired
    private TopicMarkDataInitializer self;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseRepository courseRepository;
    private final AssessmentRepository assessmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseAssessmentTypeWeightRepository courseAssessmentTypeWeightRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final CourseClassRepository courseClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TopicMarkRepository topicMarkRepository;

    @Override
    public void run(String... args) {
        try {
            self.initialize();
        } catch (Exception e) {
            log.error("Failed to initialize topic mark data. Full error:", e);
        }
    }

    @Transactional
    public void initialize() {
        log.info("Initializing topic mark sample data...");

        // 1. Create or get sample student user
        User student = userRepository.findByEmail("student@test.com")
                .orElseGet(() -> {
                    User u = User.builder()
                            .email("student@test.com")
                            .firstName("John")
                            .lastName("Doe")
                            .passwordHash(passwordEncoder.encode("password123"))
                            .isActive(true)
                            .build();
                    return userRepository.save(u);
                });
        log.info("✓ Created/found student user: {}", student.getEmail());

        // 2. Create or get assessment types (reuse names with length >= 5 chars to pass @Size(min=5) validation)
        AssessmentType quizType = createOrGetAssessmentType("Entrance Quiz", "Short quizzes to test understanding");
        AssessmentType examType = createOrGetAssessmentType("Midterm Test", "Comprehensive midterm examinations");
        AssessmentType labType = createOrGetAssessmentType("Final Exam", "Hands-on practical final exercises");
        log.info("✓ Created/found 3 assessment types: Entrance Quiz, Midterm Test, Final Exam");

        // 3. Create demo course
        User admin = userRepository.findByEmail("admin@example.com")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Course demoCourse = entityManager
                .createQuery("SELECT c FROM Course c WHERE c.courseCode = :code", Course.class)
                .setParameter("code", "DEMO-COURSE-TM")
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    Course course = Course.builder()
                            .courseName("Demo Course for Topic Marks")
                            .courseCode("DEMO-COURSE-TM")
                            .topicId(1L)
                            .price(BigDecimal.valueOf(5_000_000))
                            .discount(0.0)
                            .level(CourseLevel.BEGINNER)
                            .estimatedTime(30 * 24 * 60)
                            .thumbnailUrl("https://example.com/demo-tm.jpg")
                            .status(CourseStatus.ACTIVE)
                            .description("Demo course for testing Topic Mark calculations")
                            .note("Test data")
                            .minGpaToPass(60.0)
                            .minAttendancePercent(70.0)
                            .allowFinalRetake(true)
                            .creator(admin)
                            .build();
                    return courseRepository.save(course);
                });
        log.info("✓ Created/found demo course: {}", demoCourse.getCourseCode());

        // 4. Create course assessment type weights (Quiz 30%, Exam 50%, Lab 20%)
        createWeightIfNotExists(demoCourse, quizType, 0.3);
        createWeightIfNotExists(demoCourse, examType, 0.5);
        createWeightIfNotExists(demoCourse, labType, 0.2);
        log.info("✓ Set assessment type weights: Quiz 30%, Exam 50%, Lab 20%");

        // 5. Get or create semester
        Semester semester = entityManager
                .createQuery("SELECT s FROM Semester s WHERE s.name = :name", Semester.class)
                .setParameter("name", "Demo Semester 2026")
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    Semester s = new Semester();
                    s.setName("Demo Semester 2026");
                    s.setStartDate(Date.valueOf("2026-01-01").toLocalDate());
                    s.setEndDate(Date.valueOf("2026-12-31").toLocalDate());
                    entityManager.persist(s);
                    return s;
                });

        TrainingClass trainingClass = entityManager
                .createQuery("SELECT tc FROM TrainingClass tc WHERE tc.classCode = :code", TrainingClass.class)
                .setParameter("code", "TC-DEMO-01")
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    TrainingClass tc = new TrainingClass();
                    tc.setClassCode("TC-DEMO-01");
                    tc.setClassName("Demo Training Class 01");
                    tc.setCreator(admin);
                    tc.setSemester(semester);
                    tc.setIsActive(true);
                    tc.setStartDate(Date.valueOf("2026-01-01").toLocalDate());
                    tc.setEndDate(Date.valueOf("2026-06-30").toLocalDate());
                    entityManager.persist(tc);
                    return tc;
                });
        log.info("✓ Created/found training class: {}", trainingClass.getClassCode());

        // 6. Create CourseClass linking the course and training class
        CourseClass courseClass = entityManager
                .createQuery("SELECT cc FROM CourseClass cc WHERE cc.course.id = :courseId AND cc.classInfo.id = :classId", CourseClass.class)
                .setParameter("courseId", demoCourse.getId())
                .setParameter("classId", trainingClass.getId())
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    CourseClass cc = new CourseClass();
                    cc.setCourse(demoCourse);
                    cc.setClassInfo(trainingClass);
                    entityManager.persist(cc);
                    return cc;
                });
        log.info("✓ Created/found course class");

        // 7. Create Enrollment (student enrolled in training class)
        entityManager
                .createQuery("SELECT e FROM Enrollment e WHERE e.user.id = :userId AND e.trainingClass.id = :classId", Enrollment.class)
                .setParameter("userId", student.getId())
                .setParameter("classId", trainingClass.getId())
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    Enrollment enrollment = new Enrollment();
                    enrollment.setUser(student);
                    enrollment.setTrainingClass(trainingClass);
                    enrollment.setStatus(EnrollmentStatus.ACTIVE);
                    entityManager.persist(enrollment);
                    return enrollment;
                });
        log.info("✓ Created/found enrollment for student");

        // 8. Create assessments with multiple submissions
        // Quiz 1 - HIGHEST grading: scores [80, 85, 90] → 90
        createAssessmentWithSubmissions(courseClass, student, quizType,
                "Quiz 1 - Chapter 1", GradingMethod.HIGHEST,
                List.of(80.0, 85.0, 90.0));

        // Quiz 2 - HIGHEST grading: scores [70, 75] → 75
        createAssessmentWithSubmissions(courseClass, student, quizType,
                "Quiz 2 - Chapter 2", GradingMethod.HIGHEST,
                List.of(70.0, 75.0));

        // Midterm Exam - LATEST grading: scores [65, 70] → 70 (most recent)
        createAssessmentWithSubmissions(courseClass, student, examType,
                "Midterm Exam", GradingMethod.LATEST,
                List.of(65.0, 70.0));

        // Lab Assignment - AVERAGE grading: scores [85, 90, 95] → 90
        createAssessmentWithSubmissions(courseClass, student, labType,
                "Lab Assignment", GradingMethod.AVERAGE,
                List.of(85.0, 90.0, 95.0));

        log.info("✓ Created 4 assessments with multiple submissions");

        // 9. Create / update TopicMark record for this student
        // Expected: Quiz(30%)=(90+75)/2*0.3=24.75, Exam(50%)=70*0.5=35.0, Lab(20%)=90*0.2=18.0 → 77.75
        double finalScore = 77.75;
        boolean isPassed = finalScore >= demoCourse.getMinGpaToPass();
        topicMarkRepository.findByCourseClassIdAndUserId(courseClass.getId(), student.getId())
                .ifPresentOrElse(
                    tm -> {
                        tm.setFinalScore(finalScore);
                        tm.setIsPassed(isPassed);
                        tm.setUpdatedAt(java.time.LocalDateTime.now());
                        topicMarkRepository.save(tm);
                        log.info("✓ Updated existing TopicMark → score={}, passed={}", finalScore, isPassed);
                    },
                    () -> {
                        TopicMark tm = TopicMark.builder()
                                .courseClass(courseClass)
                                .user(student)
                                .finalScore(finalScore)
                                .isPassed(isPassed)
                                .updatedAt(java.time.LocalDateTime.now())
                                .build();
                        topicMarkRepository.save(tm);
                        log.info("✓ Created TopicMark → score={}, passed={}", finalScore, isPassed);
                    }
                );

        log.info("=====================================");
        log.info("Topic mark sample data initialized successfully!");
        log.info("Expected calculation:");
        log.info("  - Quiz 1 (HIGHEST): 90");
        log.info("  - Quiz 2 (HIGHEST): 75");
        log.info("  - Quiz type average: (90 + 75) / 2 = 82.5");
        log.info("  - Quiz contribution: 82.5 × 0.3 = 24.75");
        log.info("  - Midterm (LATEST): 70");
        log.info("  - Exam contribution: 70 × 0.5 = 35.0");
        log.info("  - Lab (AVERAGE): 90");
        log.info("  - Lab contribution: 90 × 0.2 = 18.0");
        log.info("  - Final score: 24.75 + 35.0 + 18.0 = 77.75");
        log.info("  - Pass status: 77.75 >= 60.0 = PASS ✓");
        log.info("=====================================");
    }

    private AssessmentType createOrGetAssessmentType(String name, String description) {
        AssessmentType existing = entityManager
                .createQuery("SELECT a FROM AssessmentType a WHERE a.name = :name", AssessmentType.class)
                .setParameter("name", name)
                .getResultStream()
                .findFirst()
                .orElse(null);

        if (existing != null) {
            return existing;
        }

        AssessmentType newType = new AssessmentType();
        newType.setName(name);
        newType.setDescription(description);
        return assessmentTypeRepository.save(newType);
    }

    private void createWeightIfNotExists(Course course, AssessmentType type, Double weight) {
        Long count = entityManager
                .createQuery("SELECT COUNT(w) FROM CourseAssessmentTypeWeight w WHERE w.course.id = :courseId AND w.assessmentType.id = :typeId", Long.class)
                .setParameter("courseId", course.getId())
                .setParameter("typeId", type.getId())
                .getSingleResult();

        if (count == 0) {
            CourseAssessmentTypeWeight w = new CourseAssessmentTypeWeight();
            w.setCourse(course);
            w.setAssessmentType(type);
            w.setWeight(weight);
            courseAssessmentTypeWeightRepository.save(w);
        }
    }

    private void createAssessmentWithSubmissions(CourseClass courseClass, User student,
            AssessmentType assessmentType, String title,
            GradingMethod gradingMethod, List<Double> scores) {

        Assessment assessment = entityManager
                .createQuery("SELECT a FROM Assessment a WHERE a.title = :title", Assessment.class)
                .setParameter("title", title)
                .getResultStream()
                .findFirst()
                .orElseGet(() -> {
                    Assessment a = new Assessment();
                    String cleanTitle = title.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
                    a.setCode("ASSESS-" + cleanTitle.substring(0, Math.min(8, cleanTitle.length())));
                    a.setTitle(title);
                    a.setDescription("Sample assessment: " + title);
                    a.setTotalScore((int) 100.0);
                    a.setPassScore((int) 60.0);
                    a.setTimeLimitMinutes(60);
                    a.setAttemptLimit(scores.size() + 1);
                    a.setGradingMethod(gradingMethod);
                    a.setAssessmentType(assessmentType);
                    a.setStatus(AssessmentStatus.ACTIVE);
                    return assessmentRepository.save(a);
                });

        for (int i = 0; i < scores.size(); i++) {
            final int attemptNum = i + 1;
            final double score = scores.get(i);

            Long subCount = entityManager
                    .createQuery("SELECT COUNT(s) FROM Submission s WHERE s.assessment.id = :assessmentId AND s.user.id = :userId AND s.courseClass.id = :courseClassId AND s.attemptNumber = :attemptNumber", Long.class)
                    .setParameter("assessmentId", assessment.getId())
                    .setParameter("userId", student.getId())
                    .setParameter("courseClassId", courseClass.getId())
                    .setParameter("attemptNumber", attemptNum)
                    .getSingleResult();

            if (subCount == 0) {
                Submission sub = new Submission();
                sub.setAssessment(assessment);
                sub.setCourseClass(courseClass);
                sub.setUser(student);
                sub.setStatus(SubmissionStatus.GRADED);
                sub.setTotalScore(score);
                sub.setIsPassed(score >= assessment.getPassScore());
                sub.setAttemptNumber(attemptNum);
                sub.setStartedAt(java.time.LocalDateTime.now().minusHours(1));
                sub.setSubmittedAt(java.time.LocalDateTime.now());
                submissionRepository.save(sub);
            }
        }
    }
}
