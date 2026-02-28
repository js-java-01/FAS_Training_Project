package com.example.starter_project_2025.system.topic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TopicCreateRequest {

    @NotBlank(message = "Topic code is required")
    private String code;

    @NotBlank(message = "Topic name is required")
    private String name;

    @NotBlank(message = "Level is required")
    private String level;

    private String description;
}