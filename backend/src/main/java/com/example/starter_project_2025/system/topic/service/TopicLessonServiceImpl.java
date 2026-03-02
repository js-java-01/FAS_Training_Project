package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicLessonCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicLessonUpdateRequest;
import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import com.example.starter_project_2025.system.topic.mapper.TopicLessonMapper;
import com.example.starter_project_2025.system.topic.repository.TopicLessonRepository;
import com.example.starter_project_2025.system.topic.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TopicLessonServiceImpl implements TopicLessonService {

    private final TopicLessonRepository topicLessonRepository;
    private final TopicRepository topicRepository;
    private final TopicLessonMapper topicLessonMapper;

    // ─── 3.2.17.19 View Topic Outline ───────────────────────────────────
    @Override
    public List<TopicLessonResponse> getLessonsByTopicId(UUID topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new RuntimeException("Topic not found: " + topicId);
        }
        return topicLessonRepository.findByTopicIdOrderByLessonOrderAsc(topicId)
                .stream()
                .map(topicLessonMapper::toResponse)
                .toList();
    }

    // ─── 3.2.17.20 Add Topic Outline (Create Lesson) ────────────────────
    @Override
    public TopicLessonResponse create(UUID topicId, TopicLessonCreateRequest request) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found: " + topicId));

        // Assign order = count of existing lessons + 1
        long existingCount = topicLessonRepository.countByTopicId(topicId);
        int order = (int) (existingCount + 1);

        TopicLesson lesson = TopicLesson.builder()
                .lessonName(request.getLessonName())
                .description(request.getDescription())
                .lessonOrder(order)
                .topic(topic)
                .build();

        TopicLesson saved = topicLessonRepository.save(lesson);
        return topicLessonMapper.toResponse(saved);
    }

    // ─── Update Lesson ───────────────────────────────────────────────────
    @Override
    public TopicLessonResponse update(UUID topicId, UUID lessonId, TopicLessonUpdateRequest request) {
        TopicLesson lesson = topicLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        if (!lesson.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Lesson does not belong to topic: " + topicId);
        }

        if (request.getLessonName() != null && !request.getLessonName().isBlank()) {
            lesson.setLessonName(request.getLessonName());
        }
        if (request.getDescription() != null) {
            lesson.setDescription(request.getDescription());
        }

        TopicLesson saved = topicLessonRepository.save(lesson);
        return topicLessonMapper.toResponse(saved);
    }

    // ─── Delete Lesson ───────────────────────────────────────────────────
    @Override
    public void delete(UUID topicId, UUID lessonId) {
        TopicLesson lesson = topicLessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));

        if (!lesson.getTopic().getId().equals(topicId)) {
            throw new RuntimeException("Lesson does not belong to topic: " + topicId);
        }

        topicLessonRepository.deleteById(lessonId);
    }
}
