package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic.enums.TopicLevel;
import com.example.starter_project_2025.system.topic.enums.TopicStatus;
import lombok.Data;

@Data
public class TopicUpdateRequest {
    private String topicName;
    private TopicLevel level;
    private TopicStatus status;
    private String description;
    private String version;
}