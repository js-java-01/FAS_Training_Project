package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.topic.dto.TopicSessionRequest;
import com.example.starter_project_2025.system.topic.dto.TopicSessionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface TopicSessionService {
    TopicSessionResponse create(TopicSessionRequest request);

    TopicSessionResponse update(UUID sessionId, TopicSessionRequest request);

    void delete(UUID sessionId);

    TopicSessionResponse getById(UUID sessionId);

    List<TopicSessionResponse> getByLessonId(UUID lessonId);

    ResponseEntity<byte[]> exportSessions(UUID lessonId);

    ResponseEntity<byte[]> downloadSessionTemplate();

    ImportResultResponse importSessions(UUID lessonId, MultipartFile file);
}
