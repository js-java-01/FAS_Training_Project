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

    /** Find a specific slot entry for a student. */
    Optional<TopicMarkEntry> findByComponentIdAndComponentIndexAndUserIdAndTrainingClassId(
            UUID componentId, Integer componentIndex, UUID userId, UUID trainingClassId);

    /** All entries for a given component (all students, all indices). */
    List<TopicMarkEntry> findByComponentId(UUID componentId);

    /** All entries for a student in one topic–class. */
    @Query("""
        SELECT e FROM TopicMarkEntry e
        WHERE e.topic.id = :topicId AND e.trainingClass.id = :trainingClassId
          AND e.user.id = :userId
        ORDER BY e.component.displayOrder ASC, e.componentIndex ASC
    """)
    List<TopicMarkEntry> findByTopicAndClassAndUser(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId,
            @Param("userId") UUID userId);

    /** All entries for all students in one topic–class. */
    @Query("""
        SELECT e FROM TopicMarkEntry e
        WHERE e.topic.id = :topicId AND e.trainingClass.id = :trainingClassId
        ORDER BY e.user.firstName ASC, e.component.displayOrder ASC, e.componentIndex ASC
    """)
    List<TopicMarkEntry> findByTopicAndClass(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId);

    /** How many entries in a component have a non-null score (any index). */
    @Query("SELECT COUNT(e) FROM TopicMarkEntry e WHERE e.component.id = :componentId AND e.score IS NOT NULL")
    long countScoredByComponentId(@Param("componentId") UUID componentId);
}