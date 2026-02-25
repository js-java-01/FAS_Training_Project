package com.example.starter_project_2025.system.course.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;


@Getter @Setter
public class LessonCreateRequest {
    private String lessonName;
    private String description;
    private UUID courseId;
}