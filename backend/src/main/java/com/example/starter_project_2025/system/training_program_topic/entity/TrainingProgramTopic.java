package com.example.starter_project_2025.system.training_program_topic.entity;

import com.example.starter_project_2025.system.topic.entity.Topic;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingProgramTopic
{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne()
    private Topic topic;
    @ManyToOne()
    private TrainingProgram trainingProgram;

    private Set<UUID> trainingProgramIds;
}
