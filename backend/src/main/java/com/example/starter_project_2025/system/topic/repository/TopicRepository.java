package com.example.starter_project_2025.system.topic.repository;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Repository
public interface TopicRepository extends JpaRepository<Topic, UUID>, JpaSpecificationExecutor<Topic>
{

    boolean existsByTopicCode(String topicCode);

    @Query("SELECT t FROM Topic t WHERE " +
            "(:keyword IS NULL OR LOWER(t.topicName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(t.topicCode) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:status IS NULL OR t.status = :status)")
    Page<Topic> findAllByFilters(
            @Param("keyword") String keyword,
            @Param("status") TopicStatus status,
            Pageable pageable);

    Topic findByTopicName(String topicName);

    Set<Topic> findByTopicCodeIn(List<String> topicCodes);

    @Query("SELECT DISTINCT t, tp FROM Topic t " +
            "JOIN t.trainingProgramTopics tpt " +
            "JOIN tpt.trainingProgram tp " +
            "JOIN tp.trainingClasses tc " +
            "JOIN tc.enrollments e " +
            "WHERE e.user.id = :userId " +
            "AND (:classId IS NULL OR tc.id = :classId) " +
            "AND (:keyword IS NULL OR " +
            "LOWER(t.topicName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.topicCode) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Object[]> findMyTopicsWithProgram(UUID userId, UUID classId, Pageable pageable);
}