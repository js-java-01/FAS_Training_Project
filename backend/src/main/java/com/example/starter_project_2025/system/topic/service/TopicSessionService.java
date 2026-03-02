package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicSessionRequest;
import com.example.starter_project_2025.system.topic.dto.TopicSessionResponse;

import java.util.List;
import java.util.UUID;

public interface TopicSessionService {
    TopicSessionResponse create(TopicSessionRequest request);

    TopicSessionResponse update(UUID sessionId, TopicSessionRequest request);

    void delete(UUID sessionId);

    TopicSessionResponse getById(UUID sessionId);

    List<TopicSessionResponse> getByLessonId(UUID lessonId);
}
