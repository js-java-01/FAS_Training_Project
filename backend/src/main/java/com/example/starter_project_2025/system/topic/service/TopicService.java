package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicCreateRequest;
import com.example.starter_project_2025.system.topic.dto.TopicDetailResponse;
import com.example.starter_project_2025.system.topic.dto.TopicResponse;
import com.example.starter_project_2025.system.topic.dto.UpdateTopicRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TopicService
{

    TopicResponse create(TopicCreateRequest request);

    TopicResponse update(UUID id, UpdateTopicRequest request);

    TopicResponse getById(UUID id);

    List<TopicResponse> getByIds(List<UUID> ids);

    Page<TopicResponse> getAll(String keyword, String level, String status, Pageable pageable);

    void delete(UUID id);


    Page<TopicDetailResponse> getMyTopics(UUID userId, UUID classId, String keyword, Pageable pageable);
}