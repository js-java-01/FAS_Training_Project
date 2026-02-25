package com.example.starter_project_2025.system.course.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ObjectiveUpdateRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;
}
