package com.example.starter_project_2025.system.learning.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

import com.example.starter_project_2025.system.course_online.dto.CourseOnlineResponse;

@Data
@Builder
public class EnrolledCourseResponse {
    private UUID courseId;
    private CourseOnlineResponse course;
}
