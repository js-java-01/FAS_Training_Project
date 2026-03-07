package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicMarkColumnRepository extends JpaRepository<TopicMarkColumn, UUID> {

    @Query("""
        SELECT c FROM TopicMarkColumn c
        WHERE c.topic.id = :topicId AND c.trainingClass.id = :trainingClassId
          AND c.isDeleted = false
        ORDER BY c.assessmentType.name ASC, c.columnIndex ASC
    """)
    List<TopicMarkColumn> findActiveByTopicAndClass(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId);

    @Query("""
        SELECT c FROM TopicMarkColumn c
        WHERE c.topic.id = :topicId AND c.trainingClass.id = :trainingClassId
        ORDER BY c.assessmentType.name ASC, c.columnIndex ASC
    """)
    List<TopicMarkColumn> findAllByTopicAndClass(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId);

    @Query("""
        SELECT COALESCE(MAX(c.columnIndex), 0)
        FROM TopicMarkColumn c
        WHERE c.topic.id = :topicId
          AND c.trainingClass.id = :trainingClassId
          AND c.assessmentType.id = :assessmentTypeId
    """)
    int findMaxColumnIndex(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId,
            @Param("assessmentTypeId") String assessmentTypeId);

    @Query("""
        SELECT COUNT(e) > 0 FROM TopicMarkEntry e
        WHERE e.topicMarkColumn.id = :columnId AND e.score IS NOT NULL
    """)
    boolean hasNonNullEntries(@Param("columnId") UUID columnId);

    Optional<TopicMarkColumn> findByTopicIdAndTrainingClassIdAndAssessmentTypeIdAndColumnIndex(
            UUID topicId, UUID trainingClassId, String assessmentTypeId, Integer columnIndex);
}