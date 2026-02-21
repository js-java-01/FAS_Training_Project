package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.dto.CourseUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CourseService {

    CourseResponse create(CourseCreateRequest request);

    CourseResponse update(UUID id, CourseUpdateRequest request);

    CourseResponse getById(UUID id);

    Page<CourseResponse> getAll(Pageable pageable);

    void delete(UUID id);
}
