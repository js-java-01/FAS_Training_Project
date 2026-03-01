package com.example.starter_project_2025.system.course_class.service;

import com.example.starter_project_2025.system.course_class.dto.CourseClassRequest;
import com.example.starter_project_2025.system.course_class.dto.CourseClassResponse;

import java.util.List;
import java.util.UUID;

public interface CourseClassService {

    List<CourseClassResponse> getAll();

    List<CourseClassResponse> getByClassId(UUID classId);

    CourseClassResponse create(CourseClassRequest request);
}
