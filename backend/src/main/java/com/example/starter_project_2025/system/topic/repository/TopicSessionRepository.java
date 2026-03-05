package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.TopicSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TopicSessionRepository extends JpaRepository<TopicSession, UUID> {
    List<TopicSession> findByLessonIdOrderBySessionOrderAsc(UUID lessonId);

    boolean existsByLessonIdAndSessionOrder(UUID lessonId, Integer sessionOrder);

    boolean existsByLessonIdAndSessionOrderAndIdNot(UUID lessonId, Integer sessionOrder, UUID id);
}
