package com.example.starter_project_2025.system.course.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class LessonResponse {
    private UUID id;
    private String lessonName;
    private String description;
    private UUID courseId;
}
