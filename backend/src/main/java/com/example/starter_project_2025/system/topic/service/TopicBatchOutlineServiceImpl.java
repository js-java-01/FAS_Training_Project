package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.topic.dto.TopicBatchCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicLessonBatchItem;
import com.example.starter_project_2025.system.topic.dto.TopicSessionBatchItem;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import com.example.starter_project_2025.system.topic.entity.TopicSession;
import com.example.starter_project_2025.system.topic.repository.TopicLessonRepository;
import com.example.starter_project_2025.system.topic.repository.TopicObjectiveRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import com.example.starter_project_2025.system.topic.repository.TopicSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TopicBatchOutlineServiceImpl implements TopicBatchOutlineService {

    private final TopicRepository topicRepository;
    private final TopicLessonRepository topicLessonRepository;
    private final TopicSessionRepository topicSessionRepository;
    private final TopicObjectiveRepository topicObjectiveRepository;

    @Override
    public void createBatch(TopicBatchCreateRequest request) {
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", request.getTopicId()));

        if (request.getLessons() == null || request.getLessons().isEmpty()) {
            throw new BadRequestException("At least one lesson is required.");
        }

        int nextLessonOrder = getNextLessonOrder(topic.getId());

        for (TopicLessonBatchItem lessonItem : request.getLessons()) {
            if (lessonItem.getLessonName() == null || lessonItem.getLessonName().trim().isEmpty()) {
                throw new BadRequestException("Lesson name is required.");
            }

            List<TopicSessionBatchItem> sessions = lessonItem.getSessions();
            if (sessions == null || sessions.isEmpty()) {
                throw new BadRequestException("Each lesson must include at least one session.");
            }

            TopicLesson lesson = TopicLesson.builder()
                    .topic(topic)
                    .lessonName(lessonItem.getLessonName().trim())
                    .description(lessonItem.getDescription() != null ? lessonItem.getDescription().trim() : null)
                    .lessonOrder(nextLessonOrder++)
                    .build();
            TopicLesson savedLesson = topicLessonRepository.save(lesson);

            int sessionOrder = 1;
            for (TopicSessionBatchItem sessionItem : sessions) {
                if (sessionItem.getDeliveryType() == null || sessionItem.getDeliveryType().trim().isEmpty()) {
                    throw new BadRequestException("Delivery type is required for each session.");
                }
                if (sessionItem.getDuration() == null || sessionItem.getDuration() <= 0) {
                    throw new BadRequestException("Duration must be greater than 0 for each session.");
                }

                TopicSession session = TopicSession.builder()
                        .lesson(savedLesson)
                        .deliveryType(sessionItem.getDeliveryType().trim())
                        .trainingFormat(sessionItem.getTrainingFormat() != null ? sessionItem.getTrainingFormat().trim() : null)
                        .duration(sessionItem.getDuration())
                        .sessionOrder(sessionOrder++)
                        .content(sessionItem.getContent() != null ? sessionItem.getContent().trim() : null)
                        .note(sessionItem.getNote() != null ? sessionItem.getNote().trim() : null)
                        .build();

                Set<TopicObjective> objectives = resolveObjectives(sessionItem.getLearningObjectiveIds(), topic.getId());
                session.setLearningObjectives(objectives);
                topicSessionRepository.save(session);
            }
        }
    }

    private int getNextLessonOrder(UUID topicId) {
        return topicLessonRepository.findByTopicIdOrderByLessonOrderAsc(topicId)
                .stream()
                .map(TopicLesson::getLessonOrder)
                .filter(order -> order != null && order > 0)
                .max(Integer::compareTo)
                .orElse(0) + 1;
    }

    private Set<TopicObjective> resolveObjectives(List<UUID> objectiveIds, UUID topicId) {
        if (objectiveIds == null || objectiveIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        List<TopicObjective> objectives = topicObjectiveRepository.findAllById(objectiveIds);
        if (objectives.size() != objectiveIds.size()) {
            throw new BadRequestException("One or more learning objectives are invalid.");
        }

        boolean invalidTopic = objectives.stream()
                .anyMatch(objective -> !objective.getTopic().getId().equals(topicId));
        if (invalidTopic) {
            throw new BadRequestException("Learning objectives must belong to the selected topic.");
        }

        return new LinkedHashSet<>(objectives);
    }
}
