package com.example.starter_project_2025.system.course.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;
@Data
public class SessionResponse {
    private UUID id;
    private String topic;
    private String type;
    private String studentTasks;
    private Integer sessionOrder;
    private UUID lessonId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
