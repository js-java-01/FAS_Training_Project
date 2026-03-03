package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.topic.dto.TopicSessionRequest;
import com.example.starter_project_2025.system.topic.dto.TopicSessionResponse;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import com.example.starter_project_2025.system.topic.entity.TopicSession;
import com.example.starter_project_2025.system.topic.repository.TopicLessonRepository;
import com.example.starter_project_2025.system.topic.repository.TopicObjectiveRepository;
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
public class TopicSessionServiceImpl implements TopicSessionService {

    private final TopicSessionRepository topicSessionRepository;
    private final TopicLessonRepository topicLessonRepository;
    private final TopicObjectiveRepository topicObjectiveRepository;

    @Override
    public TopicSessionResponse create(TopicSessionRequest request) {
        TopicLesson lesson = getLessonOrThrow(request.getLessonId());
        validateUniqueOrder(lesson.getId(), request.getSessionOrder(), null);

        TopicSession session = new TopicSession();
        mapRequest(session, request, lesson);

        return toResponse(topicSessionRepository.save(session));
    }

    @Override
    public TopicSessionResponse update(UUID sessionId, TopicSessionRequest request) {
        TopicSession session = topicSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("TopicSession", "id", sessionId));

        TopicLesson lesson = getLessonOrThrow(request.getLessonId());
        validateUniqueOrder(lesson.getId(), request.getSessionOrder(), sessionId);

        mapRequest(session, request, lesson);

        return toResponse(topicSessionRepository.save(session));
    }

    @Override
    public void delete(UUID sessionId) {
        if (!topicSessionRepository.existsById(sessionId)) {
            throw new ResourceNotFoundException("TopicSession", "id", sessionId);
        }
        topicSessionRepository.deleteById(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public TopicSessionResponse getById(UUID sessionId) {
        TopicSession session = topicSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("TopicSession", "id", sessionId));
        return toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicSessionResponse> getByLessonId(UUID lessonId) {
        return topicSessionRepository.findByLessonIdOrderBySessionOrderAsc(lessonId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private TopicLesson getLessonOrThrow(UUID lessonId) {
        return topicLessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("TopicLesson", "id", lessonId));
    }

    private void validateUniqueOrder(UUID lessonId, Integer sessionOrder, UUID sessionId) {
        boolean duplicate;
        if (sessionId == null) {
            duplicate = topicSessionRepository.existsByLessonIdAndSessionOrder(lessonId, sessionOrder);
        } else {
            duplicate = topicSessionRepository.existsByLessonIdAndSessionOrderAndIdNot(lessonId, sessionOrder, sessionId);
        }

        if (duplicate) {
            throw new BadRequestException("Session order already exists in the selected lesson.");
        }
    }

    private void mapRequest(TopicSession session, TopicSessionRequest request, TopicLesson lesson) {
        if (request.getSessionOrder() == null || request.getSessionOrder() <= 0) {
            throw new BadRequestException("Session order must be greater than 0.");
        }
        if (request.getDuration() == null || request.getDuration() <= 0) {
            throw new BadRequestException("Duration must be greater than 0.");
        }
        if (request.getDeliveryType() == null || request.getDeliveryType().isBlank()) {
            throw new BadRequestException("Delivery type is required.");
        }

        session.setLesson(lesson);
        session.setDeliveryType(request.getDeliveryType().trim());
        session.setTrainingFormat(request.getTrainingFormat() != null ? request.getTrainingFormat().trim() : null);
        session.setDuration(request.getDuration());
        session.setSessionOrder(request.getSessionOrder());
        session.setContent(request.getContent() != null ? request.getContent().trim() : null);
        session.setNote(request.getNote() != null ? request.getNote().trim() : null);

        Set<TopicObjective> objectives = validateAndResolveObjectives(request.getLearningObjectiveIds(), lesson.getTopic().getId());
        session.setLearningObjectives(objectives);
    }

    private Set<TopicObjective> validateAndResolveObjectives(List<UUID> objectiveIds, UUID topicId) {
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
            throw new BadRequestException("Learning objectives must belong to the same topic.");
        }

        return new LinkedHashSet<>(objectives);
    }

    private TopicSessionResponse toResponse(TopicSession session) {
        List<UUID> learningObjectiveIds = session.getLearningObjectives()
                .stream()
                .map(TopicObjective::getId)
                .toList();

        return TopicSessionResponse.builder()
                .id(session.getId())
                .lessonId(session.getLesson().getId())
                .deliveryType(session.getDeliveryType())
                .trainingFormat(session.getTrainingFormat())
                .duration(session.getDuration())
                .sessionOrder(session.getSessionOrder())
                .learningObjectiveIds(learningObjectiveIds)
                .content(session.getContent())
                .note(session.getNote())
                .build();
    }
}
