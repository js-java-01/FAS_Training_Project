package com.example.starter_project_2025.system.topic_mark.config;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.entity.Submission;
import com.example.starter_project_2025.system.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.enums.GradingMethod;
import com.example.starter_project_2025.system.assessment.enums.SubmissionStatus;
import com.example.starter_project_2025.system.assessment.repository.AssessmentRepository;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.assessment.repository.SubmissionRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course.entity.Course;
import com.example.starter_project_2025.system.course.enums.CourseStatus;
import com.example.starter_project_2025.system.course.repository.CourseRepository;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeight;
import com.example.starter_project_2025.system.course_assessment_type_weight.CourseAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.enums.EnrollmentStatus;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.user.entity.User;
import com.example.starter_project_2025.system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Initialize sample data for Topic Mark testing.
 * Only runs in 'dev' profile.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
@Profile("dev")
public class TopicMarkDataInitializer {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssessmentTypeRepository assessmentTypeRepository;
    private final CourseAssessmentTypeWeightRepository weightRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final CourseClassRepository courseClassRepository;
    private final AssessmentRepository assessmentRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SubmissionRepository submissionRepository;

    @Bean
    CommandLineRunner initTopicMarkData() {
        return args -> {
            if (userRepository.count() > 5) {
                log.info("Data already exists, skipping topic mark initialization");
                return;
            }

            log.info("Initializing topic mark sample data...");

            // 1. Create sample student
            User student = userRepository.findByEmail("student@test.com")
                .orElseGet(() -> {
                    User u = User.builder()
                        .email("student@test.com")
                        .firstName("John")
                        .lastName("Student")
                        .passwordHash("$2a$10$dummyHashForTesting")
                        .isActive(true)
                        .build();
                    return userRepository.save(u);
                });

            // 2. Create assessment types
            AssessmentType quizType = createOrGetAssessmentType("Quiz", "Quiz assessments");
            AssessmentType examType = createOrGetAssessmentType("Exam", "Final exams");
            AssessmentType labType = createOrGetAssessmentType("Lab", "Lab exercises");

            // 3. Create course
            Course course = courseRepository.findByCourseCode("DEMO-COURSE")
                .orElseGet(() -> {
                    Course c = Course.builder()
                        .courseName("Demo Course for Topic Marks")
                        .courseCode("DEMO-COURSE")
                        .minGpaToPass(60.0)
                        .status(CourseStatus.ACTIVE)
                        .build();
                    return courseRepository.save(c);
                });

            // 4. Create course assessment type weights
            createWeightIfNotExists(course, quizType, 0.3);  // Quiz 30%
            createWeightIfNotExists(course, examType, 0.5);  // Exam 50%
            createWeightIfNotExists(course, labType, 0.2);   // Lab 20%

            // 5. Create training class
            TrainingClass trainingClass = trainingClassRepository.findByClassCode("TC-DEMO-01")
                .orElseGet(() -> {
                    TrainingClass tc = new TrainingClass();
                    tc.setClassCode("TC-DEMO-01");
                    tc.setClassName("Demo Training Class 01");
                    tc.setStartDate(java.sql.Date.valueOf("2026-01-01"));
                    tc.setEndDate(java.sql.Date.valueOf("2026-06-30"));
                    return trainingClassRepository.save(tc);
                });

            // 6. Create course class
            CourseClass courseClass = courseClassRepository.findAll().stream()
                .filter(cc -> cc.getCourse().getId().equals(course.getId())
                    && cc.getClassInfo().getId().equals(trainingClass.getId()))
                .findFirst()
                .orElseGet(() -> {
                    CourseClass cc = new CourseClass();
                    cc.setCourse(course);
                    cc.setClassInfo(trainingClass);
                    return courseClassRepository.save(cc);
                });

            // 7. Create enrollment
            enrollmentRepository.findAll().stream()
                .filter(e -> e.getUser().getId().equals(student.getId())
                    && e.getTrainingClass().getId().equals(trainingClass.getId()))
                .findFirst()
                .orElseGet(() -> {
                    Enrollment e = Enrollment.builder()
                        .user(student)
                        .trainingClass(trainingClass)
                        .status(EnrollmentStatus.ACTIVE)
                        .enrolledAt(Instant.now())
                        .build();
                    return enrollmentRepository.save(e);
                });

            // 8. Create assessments and submissions
            createAssessmentWithSubmissions(courseClass, student, quizType, "Quiz 1", 
                GradingMethod.HIGHEST, List.of(80.0, 85.0, 90.0)); // Best: 90

            createAssessmentWithSubmissions(courseClass, student, quizType, "Quiz 2", 
                GradingMethod.HIGHEST, List.of(70.0, 75.0)); // Best: 75

            createAssessmentWithSubmissions(courseClass, student, examType, "Midterm Exam", 
                GradingMethod.LATEST, List.of(65.0, 70.0)); // Latest: 70

            createAssessmentWithSubmissions(courseClass, student, labType, "Lab Assignment", 
                GradingMethod.AVERAGE, List.of(85.0, 90.0, 95.0)); // Avg: 90

            log.info("Topic mark sample data initialized successfully!");
            log.info("Expected calculation:");
            log.info("  Quiz type score: (90 + 75) / 2 = 82.5");
            log.info("  Quiz contribution: 82.5 * 0.3 = 24.75");
            log.info("  Exam contribution: 70 * 0.5 = 35.0");
            log.info("  Lab contribution: 90 * 0.2 = 18.0");
            log.info("  Final score: 24.75 + 35.0 + 18.0 = 77.75");
            log.info("  Pass status: 77.75 >= 60.0 = PASS");
        };
    }

    private AssessmentType createOrGetAssessmentType(String name, String description) {
        return assessmentTypeRepository.findAll().stream()
            .filter(at -> at.getName().equals(name))
            .findFirst()
            .orElseGet(() -> {
                AssessmentType at = new AssessmentType();
                at.setName(name);
                at.setDescription(description);
                return assessmentTypeRepository.save(at);
            });
    }

    private void createWeightIfNotExists(Course course, AssessmentType type, Double weight) {
        boolean exists = weightRepository.findAll().stream()
            .anyMatch(w -> w.getCourse().getId().equals(course.getId())
                && w.getAssessmentType().getId().equals(type.getId()));

        if (!exists) {
            CourseAssessmentTypeWeight w = CourseAssessmentTypeWeight.builder()
                .course(course)
                .assessmentType(type)
                .weight(weight)
                .build();
            weightRepository.save(w);
        }
    }

    private void createAssessmentWithSubmissions(CourseClass courseClass, User student,
                                                  AssessmentType type, String title,
                                                  GradingMethod gradingMethod, List<Double> scores) {
        // Check if assessment already exists
        List<Assessment> existing = assessmentRepository.findAll().stream()
            .filter(a -> a.getTitle().equals(title))
            .toList();

        if (!existing.isEmpty()) {
            return; // Already created
        }

        Assessment assessment = new Assessment();
        assessment.setAssessmentType(type);
        assessment.setCode("CODE-" + title.replace(" ", "-").toUpperCase());
        assessment.setTitle(title);
        assessment.setDescription("Demo assessment for " + title);
        assessment.setTotalScore(100);
        assessment.setPassScore(60);
        assessment.setTimeLimitMinutes(60);
        assessment.setAttemptLimit(3);
        assessment.setGradingMethod(gradingMethod);
        assessment.setStatus(AssessmentStatus.ACTIVE);
        assessment = assessmentRepository.save(assessment);

        // Create submissions
        LocalDateTime baseTime = LocalDateTime.now().minusDays(10);
        for (int i = 0; i < scores.size(); i++) {
            Submission submission = Submission.builder()
                .assessment(assessment)
                .courseClass(courseClass)
                .user(student)
                .status(SubmissionStatus.SUBMITTED)
                .startedAt(baseTime.plusHours(i))
                .submittedAt(baseTime.plusHours(i).plusMinutes(30))
                .totalScore(scores.get(i))
                .isPassed(scores.get(i) >= 60)
                .attemptNumber(i + 1)
                .build();
            submissionRepository.save(submission);
        }
    }
}
