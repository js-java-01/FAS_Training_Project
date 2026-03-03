package com.example.starter_project_2025.system.training_program_topic.entity;

import java.util.UUID;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingProgramTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne()
    private Topic topic;
    @ManyToOne()
    private TrainingProgram trainingProgram;
}
