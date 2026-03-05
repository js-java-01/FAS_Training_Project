package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTopicRequest
{
    private TopicStatus status;
    private String version;

    @NotBlank(message = "Topic name is required")
    @Size(max = 200, message = "Topic name must not exceed 200 characters")
    private String topicName;

    @NotNull(message = "Level is required")
    private TopicLevel level;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}