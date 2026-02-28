package com.example.starter_project_2025.system.topic.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TopicResponse {

    private UUID id;

    private String name;
    private String code;
    private String level;    // Beginner, Intermediate, Advanced
    private String status;   // Draft, Active, Rejected, v.v.
    private String version;  // v1.0, v1.1
    private String description;

    // Audit fields giống Course
    private UUID createdBy;
    private String createdByName;
    private LocalDateTime createdDate;

    private UUID updatedBy;
    private String updatedByName;
    private LocalDateTime updatedDate;
}