package com.example.starter_project_2025.system.course_class.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CourseClassResponse(
        UUID id,
        CourseInfo course,
        ClassInfo classInfo,
        TrainerInfo trainer,
        LocalDateTime createdDate,
        LocalDateTime updatedDate
) {
    public record CourseInfo(UUID id, String courseName, String courseCode) {}
    public record ClassInfo(UUID id, String className, String classCode) {}
    public record TrainerInfo(UUID id, String firstName, String lastName, String email) {}
}
