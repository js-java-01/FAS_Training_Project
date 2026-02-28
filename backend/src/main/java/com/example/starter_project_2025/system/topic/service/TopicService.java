package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.TopicUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

public interface TopicService {

    TopicResponse create(TopicCreateRequest request);

    TopicResponse update(UUID id, TopicUpdateRequest request);

    TopicResponse getById(UUID id);

    Page<TopicResponse> getAll(String keyword, String level, String status, Pageable pageable);

    void delete(UUID id);

    ByteArrayInputStream exportTopics() throws IOException;

    ByteArrayInputStream downloadTemplate() throws IOException;

    void importTopics(MultipartFile file) throws IOException;
}