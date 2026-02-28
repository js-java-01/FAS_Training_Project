package com.example.starter_project_2025.system.course.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BatchCreateRequest {

    private UUID courseId;

    @NotEmpty
    private List<LessonBatchItem> lessons;
}