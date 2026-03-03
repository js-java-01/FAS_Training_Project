package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TopicLessonRepository extends JpaRepository<TopicLesson, UUID> {

    List<TopicLesson> findByTopicIdOrderByLessonOrderAsc(UUID topicId);

    long countByTopicId(UUID topicId);
}
