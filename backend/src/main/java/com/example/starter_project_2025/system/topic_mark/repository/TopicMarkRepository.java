package com.example.starter_project_2025.system.topic_mark.repository;

import com.example.starter_project_2025.system.topic_mark.entity.TopicMark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TopicMarkRepository extends JpaRepository<TopicMark, UUID> {

    Optional<TopicMark> findByCourseClassIdAndUserId(UUID courseClassId, UUID userId);

    List<TopicMark> findAllByCourseClassId(UUID courseClassId);
}
