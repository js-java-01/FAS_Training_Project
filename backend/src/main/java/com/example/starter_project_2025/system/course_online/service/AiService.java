package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.course_online.dto.AiPreviewLessonResponse;
import com.example.starter_project_2025.system.course_online.entity.Course;

import java.util.List;

public interface AiService {
    List<AiPreviewLessonResponse> generatePreview(Course course);
}
