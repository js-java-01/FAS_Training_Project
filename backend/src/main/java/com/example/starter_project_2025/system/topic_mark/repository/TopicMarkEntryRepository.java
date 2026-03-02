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

    /** All entries for a specific student in a course class. */
    List<TopicMarkEntry> findByCourseClassIdAndUserId(UUID courseClassId, UUID userId);

    /** All entries for a course class (used for gradebook view). */
    List<TopicMarkEntry> findByCourseClassId(UUID courseClassId);

    /** Find single entry for a student on a specific column. */
    Optional<TopicMarkEntry> findByTopicMarkColumnIdAndUserId(UUID topicMarkColumnId, UUID userId);

    /** Check if ALL entries for a student in a class have non-null scores. */
    @Query("""
        SELECT COUNT(e) = 0 FROM TopicMarkEntry e
        JOIN e.topicMarkColumn col
        WHERE e.courseClass.id = :courseClassId
          AND e.user.id = :userId
          AND col.isDeleted = false
          AND e.score IS NULL
    """)
    boolean allEntriesFilled(@Param("courseClassId") UUID courseClassId,
                             @Param("userId") UUID userId);

    /** Count active (non-deleted column) entries that are null for a student. */
    @Query("""
        SELECT COUNT(e) FROM TopicMarkEntry e
        JOIN e.topicMarkColumn col
        WHERE e.courseClass.id = :courseClassId
          AND e.user.id = :userId
          AND col.isDeleted = false
          AND e.score IS NULL
    """)
    long countNullEntriesForUser(@Param("courseClassId") UUID courseClassId,
                                 @Param("userId") UUID userId);

    /** Get all entries grouped by column for GradingMethod computation. */
    @Query("""
        SELECT e FROM TopicMarkEntry e
        JOIN FETCH e.topicMarkColumn col
        JOIN FETCH col.assessmentType
        WHERE e.courseClass.id = :courseClassId
          AND e.user.id = :userId
          AND col.isDeleted = false
        ORDER BY col.assessmentType.id, col.columnIndex
    """)
    List<TopicMarkEntry> findFilledEntriesForUser(@Param("courseClassId") UUID courseClassId,
                                                  @Param("userId") UUID userId);
}
