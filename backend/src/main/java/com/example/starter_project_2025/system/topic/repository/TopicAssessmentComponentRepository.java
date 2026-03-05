package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicAssessmentComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TopicAssessmentComponentRepository
        extends JpaRepository<TopicAssessmentComponent, UUID> {

    List<TopicAssessmentComponent> findBySchemeIdOrderByDisplayOrder(UUID schemeId);

    List<TopicAssessmentComponent> findByScheme_TopicIdOrderByDisplayOrder(UUID topicId);

    @Query("SELECT SUM(c.weight) FROM TopicAssessmentComponent c WHERE c.scheme.topic.id = :topicId")
    Double sumWeightByTopicId(@Param("topicId") UUID topicId);
}