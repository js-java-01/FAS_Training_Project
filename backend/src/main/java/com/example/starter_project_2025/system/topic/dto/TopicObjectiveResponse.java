package com.example.starter_project_2025.system.topic.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TopicObjectiveResponse {

    private UUID id;

    private String code;
    private String name;
    private String details;

    private UUID topicId;

    private UUID createdBy;
    private String createdByName;
    private LocalDateTime createdDate;

    private UUID updatedBy;
    private String updatedByName;
    private LocalDateTime updatedDate;
}