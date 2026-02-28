package com.example.starter_project_2025.system.topic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TopicObjectiveCreateRequest {

    @NotBlank(message = "Objective code is required")
    private String code;

    @NotBlank(message = "Objective name is required")
    private String name;

    private String details;
}