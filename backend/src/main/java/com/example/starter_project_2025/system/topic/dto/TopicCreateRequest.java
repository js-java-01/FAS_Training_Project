package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TopicCreateRequest
{

    @NotBlank(message = "Topic code is required")
    @Size(max = 20, message = "Topic code must not exceed 20 characters")
    private String topicCode;

    @NotBlank(message = "Topic name is required")
    @Size(max = 200, message = "Topic name must not exceed 200 characters")
    private String topicName;

    @NotNull(message = "Level is required")
    private TopicLevel level;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}