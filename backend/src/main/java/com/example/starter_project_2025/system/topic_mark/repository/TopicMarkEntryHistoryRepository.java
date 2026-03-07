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

    List<TopicMarkEntryHistory> findByTopicMarkEntryId(UUID entryId);

    @Query("""
        SELECT h FROM TopicMarkEntryHistory h
        WHERE h.topicMarkEntry.topic.id = :topicId
          AND h.topicMarkEntry.trainingClass.id = :trainingClassId
          AND h.topicMarkEntry.user.id = :userId
        ORDER BY h.updatedAt DESC
    """)
    List<TopicMarkEntryHistory> findByTopicAndClassAndUser(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId,
            @Param("userId") UUID userId);

    @Query("""
        SELECT h FROM TopicMarkEntryHistory h
        WHERE h.topicMarkEntry.topic.id = :topicId
          AND h.topicMarkEntry.trainingClass.id = :trainingClassId
        ORDER BY h.updatedAt DESC
    """)
    List<TopicMarkEntryHistory> findByTopicAndClass(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId);

    @Query("""
        SELECT h FROM TopicMarkEntryHistory h
        WHERE h.topicMarkEntry.topic.id = :topicId
          AND h.topicMarkEntry.trainingClass.id = :trainingClassId
    """)
    Page<TopicMarkEntryHistory> findPageByTopicAndClass(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId,
            Pageable pageable);
}