package com.example.starter_project_2025.system.training_program.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class TrainingProgramResponse {

    private UUID id;
    private String name;
    private String description;
    private String version;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<UUID> programCourseIds;

}