package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicMarkRepository extends JpaRepository<TopicMark, UUID> {

    Optional<TopicMark> findByTopicIdAndTrainingClassIdAndUserId(
            UUID topicId, UUID trainingClassId, UUID userId);

    List<TopicMark> findByTopicIdAndTrainingClassId(UUID topicId, UUID trainingClassId);

    List<TopicMark> findByUserId(UUID userId);

    boolean existsByTopicIdAndTrainingClassIdAndUserId(
            UUID topicId, UUID trainingClassId, UUID userId);

    @Query("SELECT tm FROM TopicMark tm WHERE tm.topic.id = :topicId AND tm.trainingClass.id = :trainingClassId ORDER BY tm.user.fullName ASC")
    List<TopicMark> findByTopicAndClassOrderByName(
            @Param("topicId") UUID topicId,
            @Param("trainingClassId") UUID trainingClassId);
}