package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import com.example.starter_project_2025.system.topic.enums.AssessmentType;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentComponentRepository;
import com.example.starter_project_2025.system.topic.repository.TopicAssessmentSchemeRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntry;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkEntryRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkRepository;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Initializes sample TopicMark + TopicMarkEntry data for testing.
 *
 * Creates an assessment scheme with components for the first topic,
 * then seeds TopicMark and null TopicMarkEntry records for every
 * enrolled student in the first training class.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TopicMarkDataInitializer {

    private final TopicRepository topicRepository;
    private final TrainingClassRepository trainingClassRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final TopicAssessmentSchemeRepository schemeRepository;
    private final TopicAssessmentComponentRepository componentRepository;
    private final TopicMarkRepository topicMarkRepository;
    private final TopicMarkEntryRepository topicMarkEntryRepository;
    private final TrainingProgramTopicRepository trainingProgramTopicRepository;

    @Transactional
    public void init() {
        // Clear old data to re-initialize with random scores
        topicMarkEntryRepository.deleteAll();
        topicMarkRepository.deleteAll();
        log.info("Cleared old TopicMark data for re-initialization.");

        // ── Pick first topic & first class ─────────────────────────────────
        List<Topic> topics = topicRepository.findAll();
        List<TrainingClass> classes = trainingClassRepository.findAll();

        if (topics.isEmpty() || classes.isEmpty()) {
            log.warn("No Topics or TrainingClasses found – cannot initialize TopicMark data.");
            return;
        }

        Topic topic = topics.get(0);
        TrainingClass trainingClass = classes.get(0);

        log.info("TopicMarkDataInitializer: topic='{}', class='{}'",
                topic.getTopicName(), trainingClass.getClassCode());

        // ── Ensure assessment scheme + components ──────────────────────────
        TopicAssessmentScheme scheme = schemeRepository.findByTopicId(topic.getId())
                .orElseGet(() -> {
                    TopicAssessmentScheme s = new TopicAssessmentScheme();
                    s.setTopic(topic);
                    s.setMinGpaToPass(5.0);
                    s.setMinAttendance(80);
                    s.setAllowFinalRetake(false);
                    return schemeRepository.save(s);
                });

        // Only add components if none exist yet
        List<TopicAssessmentComponent> existingComponents = componentRepository
                .findBySchemeIdOrderByDisplayOrder(scheme.getId());
        if (existingComponents.isEmpty()) {
            List<TopicAssessmentComponent> components = new ArrayList<>();

            // Quiz × 3, weight 20%
            TopicAssessmentComponent quiz = new TopicAssessmentComponent();
            quiz.setScheme(scheme);
            quiz.setType(AssessmentType.QUIZ);
            quiz.setName("Quiz");
            quiz.setCount(3);
            quiz.setWeight(20.0);
            quiz.setDuration(15);
            quiz.setDisplayOrder(1);
            quiz.setIsGraded(true);
            quiz.setNote("3 quizzes throughout the course");
            components.add(quiz);

            // Assignment × 2, weight 30%
            TopicAssessmentComponent assignment = new TopicAssessmentComponent();
            assignment.setScheme(scheme);
            assignment.setType(AssessmentType.ASSIGNMENT);
            assignment.setName("Assignment");
            assignment.setCount(2);
            assignment.setWeight(30.0);
            assignment.setDuration(120);
            assignment.setDisplayOrder(2);
            assignment.setIsGraded(true);
            assignment.setNote("Practical coding assignments");
            components.add(assignment);

            // Final Exam × 1, weight 50%
            TopicAssessmentComponent finalExam = new TopicAssessmentComponent();
            finalExam.setScheme(scheme);
            finalExam.setType(AssessmentType.FINAL_EXAM);
            finalExam.setName("Final Exam");
            finalExam.setCount(1);
            finalExam.setWeight(50.0);
            finalExam.setDuration(120);
            finalExam.setDisplayOrder(3);
            finalExam.setIsGraded(true);
            finalExam.setNote("Comprehensive final examination");
            components.add(finalExam);

            // Participation × 1, weight 0% (not graded)
            TopicAssessmentComponent participation = new TopicAssessmentComponent();
            participation.setScheme(scheme);
            participation.setType(AssessmentType.LAB);
            participation.setName("Participation");
            participation.setCount(1);
            participation.setWeight(0.0);
            participation.setDuration(null);
            participation.setDisplayOrder(4);
            participation.setIsGraded(false);
            participation.setNote("Class participation - not graded");
            components.add(participation);

            componentRepository.saveAll(components);
            existingComponents = components;
            log.info("Created {} assessment components (total graded weight=100%)", components.size());
        }

        // ── Resolve TrainingProgramTopic ────────────────────────────────────
        TrainingProgramTopic tpt = null;
        if (trainingClass.getTrainingProgram() != null) {
            tpt = trainingProgramTopicRepository
                    .findByTrainingProgram_IdAndTopic_Id(
                            trainingClass.getTrainingProgram().getId(), topic.getId())
                    .orElse(null);
        }

        // ── Enrolled students → create TopicMark + TopicMarkEntry ──────────
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingClassId(trainingClass.getId());
        if (enrollments.isEmpty()) {
            log.warn("No enrollments found for class '{}', skipping TopicMark seeding.",
                    trainingClass.getClassCode());
            return;
        }

        int markCount = 0;
        int entryCount = 0;
        java.util.Random random = new java.util.Random(42); // fixed seed for reproducible data

        for (Enrollment enrollment : enrollments) {
            User student = enrollment.getUser();

            double weightedSum = 0.0;

            List<TopicMarkEntry> entries = new ArrayList<>();

            // Create TopicMarkEntry for each component slot with random scores
            for (TopicAssessmentComponent comp : existingComponents) {
                int count = comp.getCount() != null ? comp.getCount() : 0;
                boolean graded = Boolean.TRUE.equals(comp.getIsGraded());
                double slotTotal = 0.0;

                for (int idx = 1; idx <= count; idx++) {
                    // Graded → random score 5.0–10.0 (rounded to 1 decimal)
                    // Not graded → null
                    Double score = graded
                            ? Math.round((1.0 + random.nextDouble() * 9.0) * 10.0) / 10.0
                            : null;

                    TopicMarkEntry entry = TopicMarkEntry.builder()
                            .component(comp)
                            .componentIndex(idx)
                            .user(student)
                            .topic(topic)
                            .trainingClass(trainingClass)
                            .score(score)
                            .build();
                    entries.add(entry);
                    entryCount++;

                    if (graded && score != null) {
                        slotTotal += score;
                    }
                }

                // Weighted contribution: avg(slot scores) × weight%
                if (graded && count > 0) {
                    double avg = slotTotal / count;
                    weightedSum += avg * (comp.getWeight() / 100.0);
                }
            }

            // Round final score to 2 decimals
            double finalScore = Math.round(weightedSum * 100.0) / 100.0;
            boolean passed = finalScore >= scheme.getMinGpaToPass();

            // Create TopicMark with computed final score
            TopicMark mark = TopicMark.builder()
                    .topic(topic)
                    .trainingClass(trainingClass)
                    .user(student)
                    .trainingProgram(trainingClass.getTrainingProgram())
                    .trainingProgramTopic(tpt)
                    .finalScore(finalScore)
                    .isPassed(passed)
                    .build();
            topicMarkRepository.save(mark);
            markCount++;

            topicMarkEntryRepository.saveAll(entries);
        }

        log.info(">>> TopicMarkDataInitializer: Created {} TopicMarks + {} TopicMarkEntries for {} students.",
                markCount, entryCount, enrollments.size());
    }
}
