package com.example.starter_project_2025.system.learning.dto;

import com.example.starter_project_2025.system.course.dto.CourseResponse;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EnrolledCourseResponse {
    private UUID courseId;
    private CourseResponse course;
}
