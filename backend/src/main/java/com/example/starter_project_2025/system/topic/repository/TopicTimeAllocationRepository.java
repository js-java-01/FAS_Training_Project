package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicTimeAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TopicTimeAllocationRepository
        extends JpaRepository<TopicTimeAllocation, UUID> {

    Optional<TopicTimeAllocation> findByTopicId(UUID topicId);
}
