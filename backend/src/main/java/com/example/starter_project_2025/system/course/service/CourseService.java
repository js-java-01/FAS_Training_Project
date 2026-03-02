package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseResponse;
import com.example.starter_project_2025.system.course.dto.CourseUpdateRequest;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

public interface CourseService {

    CourseResponse create(CourseCreateRequest request);

    CourseResponse update(UUID id, CourseUpdateRequest request);

    CourseResponse getById(UUID id);

    Page<CourseResponse> getAll(String keyword, String status, String trainerId, Pageable pageable);

    void delete(UUID id);

    ByteArrayInputStream exportCourses() throws IOException;

    ByteArrayInputStream downloadTemplate() throws IOException;

    ImportResultResponse importCourses(MultipartFile file) throws IOException;
}
