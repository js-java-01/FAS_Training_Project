package com.example.starter_project_2025.system.course.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseObjectiveCreateRequest {
    @NotBlank
    private String name;

    private String description;
}
