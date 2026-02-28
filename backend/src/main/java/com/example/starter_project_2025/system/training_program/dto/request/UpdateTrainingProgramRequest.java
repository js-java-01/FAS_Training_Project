package com.example.starter_project_2025.system.training_program.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema (example = "1.0.0")
    private String version;

    // Danh sách ProgramCourse ID muốn giữ lại
    // Nếu null -> không update programCourses
    @Schema (example = "[\"courseId1\", \"courseId2\"]")
    private Set<UUID> programCourseIds;
}