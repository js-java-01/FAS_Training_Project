package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonResponse;
import com.example.starter_project_2025.system.course_online.dto.LessonUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface LessonService {
    LessonResponse create(LessonCreateRequest request);
    LessonResponse update(UUID id, LessonUpdateRequest request);
    void delete(UUID id);
    List<LessonResponse> getByCourseId(UUID courseId);
}
