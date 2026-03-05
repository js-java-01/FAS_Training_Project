package com.example.starter_project_2025.system.course_online.service;

import java.util.List;
import java.util.UUID;

import com.example.starter_project_2025.system.course_online.dto.LessonCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.LessonOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.LessonUpdateOnlineRequest;

public interface LessonOnlineService {
    LessonOnlineResponse create(LessonCreateOnlineRequest request);
    LessonOnlineResponse update(UUID id, LessonUpdateOnlineRequest request);
    void delete(UUID id);
    List<LessonOnlineResponse> getByCourseId(UUID courseId);
}
