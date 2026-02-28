package com.example.starter_project_2025.system.training_program.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
public class CreateTrainingProgramRequest {

    @NotBlank
    @Schema (example = "Java Developer Training Program")
    private String name;

    @NotBlank
    @Schema (example = "1.0.0")
    private String version;
    @Schema (example = "This training program is designed to help developers master Java programming language and related technologies.")
    private String description;

    @Schema (example = "[\"courseId1\", \"courseId2\"]")
    private Set<UUID> programCourseIds;
}