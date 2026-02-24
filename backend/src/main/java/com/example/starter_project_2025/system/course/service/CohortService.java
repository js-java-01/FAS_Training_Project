package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CohortCreateRequest;
import com.example.starter_project_2025.system.course.dto.CohortResponse;
import com.example.starter_project_2025.system.course.dto.CohortUpdateRequest;

import java.util.List;
import java.util.UUID;

public interface CohortService {

    CohortResponse create(CohortCreateRequest request);

    CohortResponse update(UUID id, CohortUpdateRequest request);

    void delete(UUID id);

    CohortResponse getById(UUID id);

    List<CohortResponse> getByCourseId(UUID courseId);

    List<CohortResponse> getAll();
}