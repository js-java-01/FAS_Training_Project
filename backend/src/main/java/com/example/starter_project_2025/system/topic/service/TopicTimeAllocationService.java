package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.TopicTimeAllocationDTO;

import java.util.UUID;

public interface TopicTimeAllocationService {
    TopicTimeAllocationDTO get(UUID topicId);

    TopicTimeAllocationDTO save(UUID topicId, TopicTimeAllocationDTO dto);
}
