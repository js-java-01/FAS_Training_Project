package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicObjectiveCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicObjectiveResponse;
import com.example.starter_project_2025.system.topic.dto.TopicObjectiveUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface TopicObjectiveService {

    TopicObjectiveResponse create(UUID topicId, TopicObjectiveCreateRequest request);

    List<TopicObjectiveResponse> getByTopic(UUID topicId);

    TopicObjectiveResponse update(UUID topicId,
                                  UUID objectiveId,
                                  TopicObjectiveUpdateRequest request);

    void delete(UUID topicId, UUID objectiveId);

    ResponseEntity<byte[]> exportObjectives(UUID topicId);

    ResponseEntity<byte[]> downloadTemplate();

    void importObjectives(UUID topicId, MultipartFile file);
}