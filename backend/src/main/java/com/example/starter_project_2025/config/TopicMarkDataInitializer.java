package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseLevel;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.semester.entity.Semester;
import com.example.starter_project_2025.system.topic_mark.entity.*;
import com.example.starter_project_2025.system.topic_mark.repository.*;
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
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TopicMarkDataInitializer implements CommandLineRunner {

    @PersistenceContext
    private EntityManager em;

    @Lazy
    @Autowired
    private TopicMarkDataInitializer self;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseRepository courseRepository;
    private final CourseAssessmentTypeWeightRepository weightRepository;
    private final TopicMarkColumnRepository columnRepository;
    private final TopicMarkEntryRepository entryRepository;
    private final TopicMarkEntryHistoryRepository historyRepository;
    private final TopicMarkRepository topicMarkRepository;

    // Entry point

    @Override
    public void run(String... args) {
        try {
            self.initialize();
        } catch (Exception e) {
            log.error("Failed to initialize topic mark seed data", e);
        }
    }

    @Transactional
    public void initialize() {
        log.info("=== TopicMarkDataInitializer: starting ===");

        // 1. Shared infrastructure

        // Use admin@example.com as seed actor; fall back to first active user.
        // If no user exists yet, skip gracefully (DB not seeded yet).
        User admin = userRepository.findByEmail("admin@example.com")
                .or(() -> userRepository.findAll().stream()
                        .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                        .findFirst())
                .orElse(null);

        if (admin == null) {
            log.warn(
                    "No active user found - TopicMark seed skipped. Will seed on next restart after UserDataInitializer runs.");
            return;
        }

        AssessmentType quizType = findOrCreateAssessmentType("Entrance Quiz", "Short entry quizzes");
        AssessmentType midtermType = findOrCreateAssessmentType("Midterm Test", "Comprehensive midterm exam");
        AssessmentType finalType = findOrCreateAssessmentType("Final Exam", "End-of-course final exam");

        Course course = findOrCreateCourse(admin);

        findOrCreateWeight(course, quizType, 0.30, GradingMethod.HIGHEST);
        findOrCreateWeight(course, midtermType, 0.50, GradingMethod.LATEST);
        findOrCreateWeight(course, finalType, 0.20, GradingMethod.AVERAGE);
        log.info("Weights: Quiz 30% HIGHEST | Midterm 50% LATEST | Final 20% AVERAGE");

        Semester semester = findOrCreateSemester();
        TrainingClass trainingClass = findOrCreateTrainingClass(semester, admin);
        CourseClass courseClass = findOrCreateCourseClass(course, trainingClass);

        // Extra classes: TC-DEMO-02 and TC-DEMO-03, each linked to 2 courses
        Course javaCourse = findCourseByCode("JBM-01");
        Course reactCourse = findCourseByCode("RFP-01");

        TrainingClass tc02 = findOrCreateTrainingClassByCode("TC-DEMO-02", "Demo Training Class 02", semester, admin);
        if (javaCourse != null)
            findOrCreateCourseClass(javaCourse, tc02);
        if (reactCourse != null)
            findOrCreateCourseClass(reactCourse, tc02);

        TrainingClass tc03 = findOrCreateTrainingClassByCode("TC-DEMO-03", "Demo Training Class 03", semester, admin);
        if (javaCourse != null)
            findOrCreateCourseClass(javaCourse, tc03);
        findOrCreateCourseClass(course, tc03); // DEMO-COURSE-TM

        TrainingClass tc04 = findOrCreateTrainingClassByCode("TC-DEMO-04", "Demo Training Class 04", semester, admin);
        CourseClass courseClass04 = findOrCreateCourseClass(course, tc04);

        log.info("Extra classes TC-DEMO-02, TC-DEMO-03, TC-DEMO-04 initialized");

        // 2. Students + enrollments

        User john = findOrCreateStudent("student@test.com", "John", "Doe");
        User alice = findOrCreateStudent("alice.johnson@test.com", "Alice", "Johnson");
        User bob = findOrCreateStudent("bob.wilson@test.com", "Bob", "Wilson");
        User carol = findOrCreateStudent("carol.davis@test.com", "Carol", "Davis");
        User david = findOrCreateStudent("david.lee@test.com", "David", "Lee");
        User eva = findOrCreateStudent("eva.chen@test.com", "Eva", "Chen");

        for (User s : List.of(john, alice, bob, carol, david, eva)) {
            findOrCreateEnrollment(s, courseClass.getCourse());
            findOrCreateEnrollment(s, courseClass04.getCourse());
        }
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
        }

        log.info("=== TopicMarkDataInitializer: completed ===");
    }

    // Helpers

    private AssessmentType findOrCreateAssessmentType(String name, String description) {
        return em.createQuery("SELECT a FROM AssessmentType a WHERE a.name = :n", AssessmentType.class)
                .setParameter("n", name)
                .getResultStream().findFirst()
                .orElseGet(() -> {
                    AssessmentType t = new AssessmentType();
                    t.setName(name);
                    t.setDescription(description);
                    return assessmentTypeRepository.save(t);
                });
    }

    private Course findOrCreateCourse(User admin) {
        return em.createQuery("SELECT c FROM Course c WHERE c.courseCode = :code", Course.class)
                .setParameter("code", "DEMO-COURSE-TM")
                .getResultStream().findFirst()
                .orElseGet(() -> courseRepository.save(Course.builder()
                        .courseName("Demo Course for Topic Marks")
                        .courseCode("DEMO-COURSE-TM")
                        .topicId(1L)
                        .price(BigDecimal.valueOf(5_000_000))
                        .discount(0.0)
                        .level(CourseLevel.BEGINNER)
                        .estimatedTime(30 * 24 * 60)
                        .thumbnailUrl("https://example.com/demo-tm.jpg")
                        .status(CourseStatus.ACTIVE)
                        .description("Demo course for testing manual Topic Mark entry")
                        .note("Seed data")
                        .minGpaToPass(6.0)
                        .minAttendancePercent(70.0)
                        .allowFinalRetake(true)
                        .creator(admin)
                        .build()));
    }

    private void findOrCreateWeight(Course course, AssessmentType type, double weight, GradingMethod gm) {
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
        }
    }

    private Semester findOrCreateSemester() {
        return em.createQuery("SELECT s FROM Semester s WHERE s.name = :n", Semester.class)
                .setParameter("n", "Demo Semester 2026")
                .getResultStream().findFirst()
                .orElseGet(() -> {
                    Semester s = new Semester();
                    s.setName("Demo Semester 2026");
                    s.setStartDate(Date.valueOf("2026-01-01").toLocalDate());
                    s.setEndDate(Date.valueOf("2026-12-31").toLocalDate());
                    em.persist(s);
                    return s;
                });
    }

    private TrainingClass findOrCreateTrainingClass(Semester semester, User admin) {
        return findOrCreateTrainingClassByCode("TC-DEMO-01", "Demo Training Class 01", semester, admin);
    }

    private TrainingClass findOrCreateTrainingClassByCode(String code, String name, Semester semester, User admin) {
        return em.createQuery("SELECT tc FROM TrainingClass tc WHERE tc.classCode = :c", TrainingClass.class)
                .setParameter("c", code)
                .getResultStream().findFirst()
                .orElseGet(() -> {
                    TrainingClass tc = new TrainingClass();
                    tc.setClassCode(code);
                    tc.setClassName(name);
                    tc.setCreator(admin);
                    tc.setSemester(semester);
                    tc.setIsActive(true);
                    tc.setStartDate(Date.valueOf("2026-01-01").toLocalDate());
                    tc.setEndDate(Date.valueOf("2026-06-30").toLocalDate());
                    em.persist(tc);
                    return tc;
                });
    }

    private Course findCourseByCode(String code) {
        return em.createQuery("SELECT c FROM Course c WHERE c.courseCode = :code", Course.class)
                .setParameter("code", code)
                .getResultStream().findFirst()
                .orElse(null);
    }

    private CourseClass findOrCreateCourseClass(Course course, TrainingClass tc) {
        return null;
        // return em.createQuery(
        // "SELECT cc FROM CourseClass cc WHERE cc.course.id = :c AND cc.classInfo.id =
        // :t", CourseClass.class)
        // .setParameter("c", course.getId())
        // .setParameter("t", tc.getId())
        // .getResultStream().findFirst()
        // .orElseGet(() -> {
        // CourseClass cc = new CourseClass();
        // cc.setCourse(course);
        // cc.setClassInfo(tc);
        // em.persist(cc);
        // return cc;
        // });
    }

    private User findOrCreateStudent(String email, String firstName, String lastName) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .email(email)
                        .firstName(firstName)
                        .lastName(lastName)
                        .passwordHash(passwordEncoder.encode("password123"))
                        .isActive(true)
                        .build()));
    }

    private void findOrCreateEnrollment(User user, Course course) {
        Long count = em.createQuery(
                "SELECT COUNT(e) FROM Enrollment e WHERE e.user.id = :u AND e.course.id = :c", Long.class)
                .setParameter("u", user.getId())
                .setParameter("c", course.getId())
                .getSingleResult();
        if (count == 0) {
            Enrollment e = new Enrollment();
            e.setUser(user);
            // e.setCourse(course);
            // e.setStatus(EnrollmentStatus.ACTIVE);
            em.persist(e);
        }
    }

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

    private void saveEntry(TopicMarkColumn column, User student, double score, User seeder) {
        TopicMarkEntry entry = entryRepository.save(TopicMarkEntry.builder()
                .topicMarkColumn(column)
                .user(student)
                .courseClass(column.getCourseClass())
                .score(score)
                .build());

        historyRepository.save(TopicMarkEntryHistory.builder()
                .topicMarkEntry(entry)
                .oldScore(null)
                .newScore(score)
                .reason("Initial seed data")
                .updatedBy(seeder)
                .build());
    }

    private void upsertTopicMark(CourseClass courseClass, User user, double finalScore, double minGpa) {
        boolean passed = finalScore >= minGpa;
        topicMarkRepository.findByCourseClassIdAndUserId(courseClass.getId(), user.getId())
                .ifPresentOrElse(tm -> {
                    tm.setFinalScore(finalScore);
                    tm.setIsPassed(passed);
                    topicMarkRepository.save(tm);
                }, () -> topicMarkRepository.save(TopicMark.builder()
                        .courseClass(courseClass)
                        .user(user)
                        .finalScore(finalScore)
                        .isPassed(passed)
                        .build()));
        log.info("  {} {} -> {} {}", user.getFirstName(), user.getLastName(),
                String.format("%.2f", finalScore), passed ? "PASS" : "FAIL");
    }
}