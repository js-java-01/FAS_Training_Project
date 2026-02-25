package com.example.starter_project_2025.system.course.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CourseObjectiveResponse {
    private UUID id;

    private String name;

    private String description;

    private LocalDateTime createdDate;
}
