package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicAssessmentScheme;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TopicAssessmentSchemeRepository
        extends JpaRepository<TopicAssessmentScheme, UUID> {

    Optional<TopicAssessmentScheme> findByTopicId(UUID topicId);
}
