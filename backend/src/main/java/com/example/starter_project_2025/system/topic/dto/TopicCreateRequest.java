package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TopicCreateRequest {

    @NotBlank(message = "Topic code is required")
    private String topicCode;

    @NotBlank(message = "Topic name is required")
    private String topicName;

    @NotBlank(message = "Level is required")
    private TopicLevel level;

    private String description;
}