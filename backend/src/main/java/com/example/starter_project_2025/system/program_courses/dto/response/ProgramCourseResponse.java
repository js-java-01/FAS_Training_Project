package com.example.starter_project_2025.system.program_courses.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ProgramCourseResponse {

    private UUID id;
    private long programmingLanguageId;
    private UUID trainingProgramId;
}