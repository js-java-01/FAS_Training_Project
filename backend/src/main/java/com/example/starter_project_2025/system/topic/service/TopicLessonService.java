package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicLessonCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicLessonResponse;
import com.example.starter_project_2025.system.topic.dto.TopicLessonUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface TopicLessonService {

    // 3.2.17.19 – View Topic Outline
    List<TopicLessonResponse> getLessonsByTopicId(UUID topicId);

    // 3.2.17.20 – Add Topic Outline
    TopicLessonResponse create(UUID topicId, TopicLessonCreateRequest request);

    // Update a lesson
    TopicLessonResponse update(UUID topicId, UUID lessonId, TopicLessonUpdateRequest request);

    // Delete a lesson
    void delete(UUID topicId, UUID lessonId);
}
