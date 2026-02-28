package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicObjective;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TopicObjectiveRepository extends JpaRepository<TopicObjective, UUID> {

    boolean existsByCodeAndTopicId(String code, UUID topicId);

    List<TopicObjective> findByTopicIdOrderByCreatedDateAsc(UUID topicId);

    boolean existsByCodeAndTopicIdAndIdNot(String code, UUID topicId, UUID id);

    boolean existsByTopicIdAndCode(UUID topicId, String code);

    List<TopicObjective> findByTopicId(UUID topicId);
}