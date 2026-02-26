package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseObjectiveCreateRequest;
import com.example.starter_project_2025.system.course.dto.CourseObjectiveResponse;
import com.example.starter_project_2025.system.course.dto.ObjectiveUpdateRequest;
import com.example.starter_project_2025.system.course.entity.CourseObjective;

import java.util.List;
import java.util.UUID;

public interface CourseObjectiveService {
    CourseObjectiveResponse create(
            UUID courseId,
            CourseObjectiveCreateRequest request);

    List<CourseObjectiveResponse> getByCourse(UUID courseId);

    CourseObjectiveResponse updateObjective(
            UUID courseId,
            UUID objectiveId,
            ObjectiveUpdateRequest request
    );

    void deleteObjective(UUID courseId, UUID objectiveId);


}
