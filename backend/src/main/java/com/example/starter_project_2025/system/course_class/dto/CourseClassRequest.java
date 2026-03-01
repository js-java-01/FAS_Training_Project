package com.example.starter_project_2025.system.course_class.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CourseClassRequest(

        @NotNull(message = "Course ID is required")
        @Schema(example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
        UUID courseId,

        @NotNull(message = "Class ID is required")
        @Schema(example = "b2c3d4e5-f6a7-8901-bcde-f12345678901")
        UUID classId,

        @Schema(example = "c3d4e5f6-a7b8-9012-cdef-123456789012", description = "Optional trainer ID")
        UUID trainerId
) {}
