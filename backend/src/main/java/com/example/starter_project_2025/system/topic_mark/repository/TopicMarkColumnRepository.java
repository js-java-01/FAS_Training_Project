package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicMarkColumnRepository extends JpaRepository<TopicMarkColumn, UUID> {

    /** All active (non-deleted) columns for a course class, ordered by assessment type then index. */
    @Query("""
        SELECT c FROM TopicMarkColumn c
        WHERE c.courseClass.id = :courseClassId
          AND c.isDeleted = false
        ORDER BY c.assessmentType.id ASC, c.columnIndex ASC
    """)
    List<TopicMarkColumn> findActiveByCourseClassId(@Param("courseClassId") UUID courseClassId);

    /** Check if a column already has any entries (to prevent deletion). */
    @Query("""
        SELECT COUNT(e) > 0 FROM TopicMarkEntry e
        WHERE e.topicMarkColumn.id = :columnId
          AND e.score IS NOT NULL
    """)
    boolean hasNonNullEntries(@Param("columnId") UUID columnId);

    /** Next available column index for a given courseClass + assessmentType. */
    @Query("""
        SELECT COALESCE(MAX(c.columnIndex), 0) + 1 FROM TopicMarkColumn c
        WHERE c.courseClass.id = :courseClassId
          AND c.assessmentType.id = :assessmentTypeId
    """)
    int nextColumnIndex(@Param("courseClassId") UUID courseClassId,
                        @Param("assessmentTypeId") String assessmentTypeId);
}
