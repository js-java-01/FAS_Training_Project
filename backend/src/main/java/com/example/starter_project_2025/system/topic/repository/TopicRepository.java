package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID> {

    boolean existsByTopicCode(String topicCode);

    @Query("SELECT t FROM Topic t WHERE " +
            "(:keyword IS NULL OR LOWER(t.topicName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.topicCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:level IS NULL OR t.level = :level) " +
            "AND (:status IS NULL OR t.status = :status)")
    Page<Topic> findAllByFilters(
            @Param("keyword") String keyword,
            @Param("level") TopicLevel level,
            @Param("status") TopicStatus status,
            Pageable pageable);
}