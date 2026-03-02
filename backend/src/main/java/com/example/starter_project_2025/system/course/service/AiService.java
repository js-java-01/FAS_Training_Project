package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.AiPreviewLessonResponse;
import com.example.starter_project_2025.system.course.entity.Course;

import java.util.List;

public interface AiService {
    List<AiPreviewLessonResponse> generatePreview(Course course);
}
