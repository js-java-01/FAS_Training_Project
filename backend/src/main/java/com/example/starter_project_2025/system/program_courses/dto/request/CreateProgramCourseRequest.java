package com.example.starter_project_2025.system.program_courses.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateProgramCourseRequest {

    @NotNull
    @Schema (example = "1")
    private long programmingLanguageId;

    @NotNull
    @Schema (example = "d290f1ee-6c54-4b01-90e6-d701748f0851")
    private UUID trainingProgramId;
}