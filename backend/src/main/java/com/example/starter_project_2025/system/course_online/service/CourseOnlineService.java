package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseCreateOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseUpdateOnlineRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

public interface CourseOnlineService {

    CourseOnlineResponse create(CourseCreateOnlineRequest request);

    CourseOnlineResponse update(UUID id, CourseUpdateOnlineRequest request);

    CourseOnlineResponse getById(UUID id);

    Page<CourseOnlineResponse> getAll(String keyword, String status, String trainerId, Pageable pageable);

    void delete(UUID id);

    ByteArrayInputStream exportCourses() throws IOException;

    ByteArrayInputStream downloadTemplate() throws IOException;

    ImportResultResponse importCourses(MultipartFile file) throws IOException;
}
