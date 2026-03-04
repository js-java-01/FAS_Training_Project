package com.example.starter_project_2025.system.training_program_topic.entity.repository;

import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.UUID;

public interface TrainingProgramTopicRepository extends JpaRepository<TrainingProgramTopic, UUID>
{
    @Modifying
    @Transactional
    void deleteAllByTopicId(UUID topicId);
}
