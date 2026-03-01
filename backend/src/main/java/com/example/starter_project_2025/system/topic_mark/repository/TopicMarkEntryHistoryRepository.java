package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMarkEntryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
