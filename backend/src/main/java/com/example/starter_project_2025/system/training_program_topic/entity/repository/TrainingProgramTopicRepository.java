package com.example.starter_project_2025.system.training_program_topic.entity.repository;

import com.example.starter_project_2025.system.training_program_topic.entity.TrainingProgramTopic;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.Optional;
import java.util.UUID;

public interface TrainingProgramTopicRepository extends JpaRepository<TrainingProgramTopic, UUID>
{
    Optional<TrainingProgramTopic> findByTrainingProgram_IdAndTopic_Id(UUID trainingProgramId, UUID topicId);

    Optional<TrainingProgramTopic> findFirstByTrainingProgram_Id(UUID trainingProgramId);

    @Modifying
    @Transactional
    void deleteAllByTopicId(UUID topicId);

    @Modifying
    @Transactional
    void deleteAllByTrainingProgram_Id(UUID trainingProgramId);
}
