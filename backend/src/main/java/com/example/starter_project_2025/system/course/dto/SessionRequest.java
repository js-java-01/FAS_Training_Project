package com.example.starter_project_2025.system.course.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SessionRequest {
    @NotBlank(message = "Topic is required")
    private String topic;

    private String type; // VIDEO_LECTURE, LIVE_SESSION, etc.

    private String studentTasks;

    @NotNull(message = "Session order is required")
    private Integer sessionOrder;

    @NotNull(message = "Lesson ID is required")
    private UUID lessonId;
    
    private UUID assessmentId;
}
