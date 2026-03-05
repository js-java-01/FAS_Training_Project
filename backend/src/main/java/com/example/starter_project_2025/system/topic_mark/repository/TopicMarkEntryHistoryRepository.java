package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntryHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TopicMarkEntryHistoryRepository extends JpaRepository<TopicMarkEntryHistory, UUID> {

    /** History for a specific entry, newest first. */
    List<TopicMarkEntryHistory> findByTopicMarkEntryIdOrderByUpdatedAtDesc(UUID topicMarkEntryId);

    /** Combined history for all entries of one student in a course class. */
    List<TopicMarkEntryHistory> findByTopicMarkEntry_CourseClass_IdAndTopicMarkEntry_User_IdOrderByUpdatedAtDesc(
            UUID courseClassId, UUID userId);

    /** Paginated full history for a course class ordered by updatedAt desc. */
    @Query(value = "SELECT h FROM TopicMarkEntryHistory h " +
                   "JOIN FETCH h.topicMarkEntry e " +
                   "JOIN FETCH e.user u " +
                   "JOIN FETCH e.topicMarkColumn c " +
                   "JOIN FETCH h.updatedBy ub " +
                   "WHERE e.courseClass.id = :courseClassId AND h.changeType IS NOT NULL",
           countQuery = "SELECT COUNT(h) FROM TopicMarkEntryHistory h " +
                        "WHERE h.topicMarkEntry.courseClass.id = :courseClassId AND h.changeType IS NOT NULL")
    Page<TopicMarkEntryHistory> findPageByCourseClassId(
            @Param("courseClassId") UUID courseClassId, Pageable pageable);
}
