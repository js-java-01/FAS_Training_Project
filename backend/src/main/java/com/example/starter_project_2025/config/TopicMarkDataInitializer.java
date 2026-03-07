package com.example.starter_project_2025.config;

import com.example.starter_project_2025.system.assessment.entity.Assessment;
import com.example.starter_project_2025.system.assessment.entity.AssessmentType;
import com.example.starter_project_2025.system.assessment.repository.AssessmentTypeRepository;
import com.example.starter_project_2025.system.classes.entity.TrainingClass;
import com.example.starter_project_2025.system.classes.repository.TrainingClassRepository;
import com.example.starter_project_2025.system.course_class.entity.CourseClass;
import com.example.starter_project_2025.system.course_class.repository.CourseClassRepository;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;
import com.example.starter_project_2025.system.course_online.repository.CourseOnlineRepository;
import com.example.starter_project_2025.system.learning.entity.Enrollment;
import com.example.starter_project_2025.system.learning.repository.EnrollmentRepository;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.entity.TopicAssessmentTypeWeight;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.repository.TopicAssessmentTypeWeightRepository;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkColumn;
import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntry;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkColumnRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkEntryRepository;
import com.example.starter_project_2025.system.topic_mark.repository.TopicMarkRepository;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import com.example.starter_project_2025.system.training_program_topic.entity.repository.TrainingProgramTopicRepository;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Seeds TopicMark records (+ default columns + entries) on startup.
 *
 * Algorithm:
 * for each TrainingProgramTopic:
 * topic = tpt.getTopic()
 * for each TrainingClass of tpt.getTrainingProgram():
 * 1. Ensure one default TopicMarkColumn per AssessmentType weight (if none
 * exist yet)
 * 2. Ensure a TopicMark row for every enrolled student
 * 3. Ensure TopicMarkEntry rows for every student x every active column
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class TopicMarkDataInitializer implements CommandLineRunner {

        private final TrainingProgramTopicRepository trainingProgramTopicRepository;
        private final TrainingClassRepository trainingClassRepository;
        private final TopicMarkRepository topicMarkRepository;
        private final TopicMarkColumnRepository topicMarkColumnRepository;
        private final TopicMarkEntryRepository topicMarkEntryRepository;
        private final TopicAssessmentTypeWeightRepository topicAssessmentTypeWeightRepository;
        private final AssessmentTypeRepository assessmentTypeRepository;
        private final EnrollmentRepository enrollmentRepository;
        private final CourseOnlineRepository courseOnlineRepository;
        private final CourseClassRepository courseClassRepository;

        private static final Random RNG = new Random(42);

        /**
         * Generate a random sample score in Vietnamese 10-point scale: 5.0 – 10.0, step
         * 0.5
         */
        private static Double randomScore() {
                // possible values: 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0 (11
                // values)
                int steps = RNG.nextInt(11); // 0..10
                return 5.0 + steps * 0.5;
        }

        @Override
        @Transactional
        public void run(String... args) {
                List<TrainingProgramTopic> allTpts = trainingProgramTopicRepository.findAll();
                if (allTpts.isEmpty()) {
                        log.info("TopicMarkDataInitializer skipped: no TrainingProgramTopics found");
                        return;
                }

                int marksCreated = 0;
                int columnsCreated = 0;
                int entriesCreated = 0;

                for (TrainingProgramTopic tpt : allTpts) {
                        TrainingProgram tp = tpt.getTrainingProgram();
                        if (tp == null)
                                continue;

                        Topic topic = tpt.getTopic();
                        if (topic == null)
                                continue;
                        UUID topicId = topic.getId();

                        List<TopicAssessmentTypeWeight> weights = topicAssessmentTypeWeightRepository
                                        .findByTopicId(topicId);

                        // Auto-seed default weights if none have been configured yet
                        if (weights.isEmpty()) {
                                String[] defaultTypes = { "Entrance Quiz", "Midterm Test", "Final Exam" };
                                double[] defaultValues = { 20.0, 30.0, 50.0 };
                                for (int i = 0; i < defaultTypes.length; i++) {
                                        final int idx = i;
                                        final Topic finalTopic = topic;
                                        assessmentTypeRepository.findByName(defaultTypes[idx])
                                                        .ifPresent(at -> topicAssessmentTypeWeightRepository.save(
                                                                        TopicAssessmentTypeWeight.builder()
                                                                                        .topic(finalTopic)
                                                                                        .assessmentType(at)
                                                                                        .weight(defaultValues[idx])
                                                                                        .build()));
                                }
                                weights = topicAssessmentTypeWeightRepository.findByTopicId(topicId);
                        }

                        // Ensure a CourseOnline exists for this topic (used by frontend dropdown)
                        CourseOnline courseOnline = courseOnlineRepository.findByCourseCode(topic.getTopicCode())
                                        .orElseGet(() -> courseOnlineRepository.save(
                                                        CourseOnline.builder()
                                                                        .courseName(topic.getTopicName())
                                                                        .courseCode(topic.getTopicCode())
                                                                        .topicId(topic.getId())
                                                                        .build()));

                        List<TrainingClass> trainingClasses = trainingClassRepository
                                        .findByTrainingProgramId(tp.getId());
                        if (trainingClasses.isEmpty())
                                continue;

                        for (TrainingClass tc : trainingClasses) {
                                UUID trainingClassId = tc.getId();

                                // Ensure a CourseClass linking this CourseOnline to this TrainingClass
                                List<CourseClass> existingCcs = courseClassRepository
                                                .findByClassInfo_Id(trainingClassId);
                                boolean ccExists = existingCcs.stream()
                                                .anyMatch(cc -> courseOnline.getId().equals(cc.getCourse().getId()));
                                if (!ccExists) {
                                        CourseClass cc = new CourseClass();
                                        cc.setCourse(courseOnline);
                                        cc.setClassInfo(tc);
                                        courseClassRepository.save(cc);
                                }

                                List<TopicMarkColumn> existingColumns = topicMarkColumnRepository
                                                .findAllByTopicAndClass(topicId, trainingClassId);

                                if (existingColumns.isEmpty() && !weights.isEmpty()) {
                                        for (TopicAssessmentTypeWeight w : weights) {
                                                AssessmentType at = w.getAssessmentType();
                                                if (at == null)
                                                        continue;
                                                TopicMarkColumn col = TopicMarkColumn.builder()
                                                                .topic(topic)
                                                                .trainingClass(tc)
                                                                .assessmentType(at)
                                                                .columnLabel(at.getName() + " 1")
                                                                .columnIndex(1)
                                                                .isDeleted(false)
                                                                .build();
                                                topicMarkColumnRepository.save(col);
                                                columnsCreated++;
                                        }
                                        existingColumns = topicMarkColumnRepository
                                                        .findAllByTopicAndClass(topicId, trainingClassId);
                                }

                                List<Enrollment> enrollments = enrollmentRepository
                                                .findByTrainingClassId(trainingClassId);
                                for (Enrollment enrollment : enrollments) {
                                        User student = enrollment.getUser();
                                        if (student == null)
                                                continue;
                                        UUID userId = student.getId();

                                        boolean markExists = topicMarkRepository
                                                        .existsByTopicIdAndTrainingClassIdAndUserId(topicId,
                                                                        trainingClassId, userId);
                                        if (!markExists) {
                                                topicMarkRepository.save(TopicMark.builder()
                                                                .topic(topic)
                                                                .trainingClass(tc)
                                                                .user(student)
                                                                .trainingProgram(tp)
                                                                .trainingProgramTopic(tpt)
                                                                .isPassed(false)
                                                                .build());
                                                marksCreated++;
                                        }

                                        for (TopicMarkColumn col : existingColumns) {
                                                if (Boolean.TRUE.equals(col.getIsDeleted()))
                                                        continue;
                                                boolean entryExists = topicMarkEntryRepository
                                                                .existsByTopicMarkColumnIdAndUserId(col.getId(),
                                                                                userId);
                                                if (!entryExists) {
                                                        topicMarkEntryRepository.save(TopicMarkEntry.builder()
                                                                        .topicMarkColumn(col)
                                                                        .user(student)
                                                                        .topic(topic)
                                                                        .trainingClass(tc)
                                                                        .score(randomScore())
                                                                        .build());
                                                        entriesCreated++;
                                                }
                                        }

                                        // Compute and save finalScore for this student
                                        List<TopicMarkColumn> activeCols = existingColumns.stream()
                                                        .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                                                        .collect(Collectors.toList());

                                        List<TopicMarkEntry> studentEntries = topicMarkEntryRepository
                                                        .findByTopicAndClassAndUser(topicId, trainingClassId, userId);

                                        Map<UUID, Double> scoreByColId = studentEntries.stream()
                                                        .filter(e -> e.getScore() != null)
                                                        .collect(Collectors.toMap(
                                                                        e -> e.getTopicMarkColumn().getId(),
                                                                        TopicMarkEntry::getScore,
                                                                        (a, b) -> a));

                                        Map<String, Double> weightByTypeId = weights.stream()
                                                        .filter(w -> w.getAssessmentType() != null
                                                                        && w.getWeight() != null)
                                                        .collect(Collectors.toMap(
                                                                        w -> w.getAssessmentType().getId(),
                                                                        TopicAssessmentTypeWeight::getWeight,
                                                                        (a, b) -> a));

                                        Map<String, List<TopicMarkColumn>> colsByType = activeCols.stream()
                                                        .collect(Collectors.groupingBy(
                                                                        c -> c.getAssessmentType().getId()));

                                        boolean allFilled = activeCols.stream()
                                                        .allMatch(c -> scoreByColId.containsKey(c.getId()));
                                        if (allFilled && !colsByType.isEmpty() && !weightByTypeId.isEmpty()) {
                                                double computed = 0.0;
                                                for (Map.Entry<String, List<TopicMarkColumn>> typeEntry : colsByType
                                                                .entrySet()) {
                                                        Double typeWeight = weightByTypeId.get(typeEntry.getKey());
                                                        if (typeWeight == null)
                                                                continue;
                                                        int count = typeEntry.getValue().size();
                                                        for (TopicMarkColumn col : typeEntry.getValue()) {
                                                                Double s = scoreByColId.get(col.getId());
                                                                if (s != null)
                                                                        computed += s * (typeWeight / 100.0) / count;
                                                        }
                                                }
                                                double rounded = Math.round(computed * 100.0) / 100.0;
                                                Double minGpa = topic.getMinGpaToPass();
                                                boolean passed = minGpa != null && rounded >= minGpa;
                                                topicMarkRepository
                                                                .findByTopicIdAndTrainingClassIdAndUserId(topicId,
                                                                                trainingClassId, userId)
                                                                .ifPresent(mark -> {
                                                                        mark.setFinalScore(rounded);
                                                                        mark.setIsPassed(passed);
                                                                        topicMarkRepository.save(mark);
                                                                });
                                        }
                                }
                        }
                }

                log.info("TopicMarkDataInitializer done: {} TopicMarks, {} columns, {} entries created",
                                marksCreated, columnsCreated, entriesCreated);
        }
}