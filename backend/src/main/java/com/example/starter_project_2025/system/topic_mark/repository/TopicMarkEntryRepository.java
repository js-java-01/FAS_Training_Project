package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicMarkEntryRepository extends JpaRepository<TopicMarkEntry, UUID> {

    Optional<TopicMarkEntry> findByTopicMarkColumnIdAndUserId(UUID columnId, UUID userId);

    List<TopicMarkEntry> findByTopicMarkColumnId(UUID columnId);

    /** All entries for a student in one topic  class */
    @Query("""
        SELECT e FROM TopicMarkEntry e
        WHERE e.topic.id = :topicId AND e.trainingClass.id = :trainingClassId
          AND e.user.id = :userId
        ORDER BY e.topicMarkColumn.assessmentType.name ASC, e.topicMarkColumn.columnIndex ASC
    """)
    List<TopicMarkEntry> findByTopicAndClassAndUser(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId,
            @Param("userId") UUID userId);

    /** All entries for all students in one topic  class */
    @Query("""
        SELECT e FROM TopicMarkEntry e
        WHERE e.topic.id = :topicId AND e.trainingClass.id = :trainingClassId
        ORDER BY e.user.fullName ASC, e.topicMarkColumn.columnIndex ASC
    """)
    List<TopicMarkEntry> findByTopicAndClass(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId);

    boolean existsByTopicMarkColumnIdAndUserId(UUID columnId, UUID userId);

    /** How many entries in a column have a non-null score */
    @Query("SELECT COUNT(e) FROM TopicMarkEntry e WHERE e.topicMarkColumn.id = :columnId AND e.score IS NOT NULL")
    long countScoredByColumnId(@Param("columnId") UUID columnId);
}