package com.example.starter_project_2025.system.training_program.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class UpdateTrainingProgramRequest {

    @Schema (example = "Java Developer Training Program")
    private String name;
    @Schema (example = "This training program is designed to help developers master Java programming language and related technologies.")
    private String description;

    @Pattern(
            regexp = "^\\d+(\\.\\d+)*$",
            message = "Version must contain only numbers separated by dots (e.g., 1.0 or 1.2.3)"
    )
    @Schema(example = "1.0.0")
    private String version;

    @Schema(example = "[\"uuid-topic-1\",\"uuid-topic-2\"]")
    private Set<UUID> topicIds;
}