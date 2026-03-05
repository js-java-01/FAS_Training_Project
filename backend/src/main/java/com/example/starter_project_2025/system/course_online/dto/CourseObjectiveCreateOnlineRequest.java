package com.example.starter_project_2025.system.course_online.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseObjectiveCreateOnlineRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String description;
}
