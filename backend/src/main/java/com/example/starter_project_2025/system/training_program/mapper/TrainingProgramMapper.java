package com.example.starter_project_2025.system.training_program.mapper;

import com.example.starter_project_2025.system.program_courses.entity.ProgramCourse;
import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class TrainingProgramMapper {

    public TrainingProgramResponse toResponse(TrainingProgram entity) {
        return null;
        // return new TrainingProgramResponse(
        // entity.getId(),
        // entity.getName(),
        // entity.getDescription(),
        // entity.getVersion(),
        // entity.getCreatedAt(),
        // entity.getUpdatedAt(),
        // entity.getTrainingProgramTopics() == null ? null
        // : entity.getTrainingProgramTopics().stream()
        // .map(tpt -> tpt.getTopic().getName())
        // .collect(Collectors.toSet()));
        // return new TrainingProgramResponse(
        // entity.getId(),
        // entity.getName(),
        // entity.getDescription(),
        // entity.getCreatedAt(),
        // entity.getUpdatedAt(),
        // entity.getTrainingProgramTopics() == null ? null
        // : entity.getTrainingProgramTopics().stream()
        // .map(tpt -> tpt.getTopic().getName())
        // .collect(Collectors.toSet()));
    }

}