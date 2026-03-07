package com.example.starter_project_2025.system.course_online.service;

import java.util.List;

import com.example.starter_project_2025.system.course_online.dto.AiPreviewLessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.entity.CourseOnline;

public interface AiOnlineService {
    List<AiPreviewLessonOnlineResponse> generatePreview(CourseOnline course);
}
