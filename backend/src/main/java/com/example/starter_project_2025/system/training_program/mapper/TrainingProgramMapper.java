package com.example.starter_project_2025.system.training_program.mapper;

import com.example.starter_project_2025.system.training_program.dto.response.TrainingProgramResponse;
import com.example.starter_project_2025.system.training_program.entity.TrainingProgram;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class TrainingProgramMapper {

    public TrainingProgramResponse toResponse(TrainingProgram entity) {

        Set<UUID> topicIds = entity.getTrainingProgramTopics() == null
                ? Set.of()
                : entity.getTrainingProgramTopics()
                .stream()
                .filter(tpt -> tpt.getTopic() != null)
                .map(tpt -> tpt.getTopic().getId())
                .collect(Collectors.toSet());

        return TrainingProgramResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .topicIds(topicIds)
                .build();
    }
}