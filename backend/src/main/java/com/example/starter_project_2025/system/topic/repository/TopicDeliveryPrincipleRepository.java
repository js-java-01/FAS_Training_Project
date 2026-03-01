package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicDeliveryPrinciple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicDeliveryPrincipleRepository
        extends JpaRepository<TopicDeliveryPrinciple, UUID> {

    Optional<TopicDeliveryPrinciple> findByTopicId(UUID topicId);

    void deleteByTopicId(UUID topicId);
}
