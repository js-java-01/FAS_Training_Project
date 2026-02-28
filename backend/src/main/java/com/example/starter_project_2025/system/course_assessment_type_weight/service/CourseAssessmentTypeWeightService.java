package com.example.starter_project_2025.system.course_assessment_type_weight.service;

import com.example.starter_project_2025.system.course_assessment_type_weight.dto.CourseWeightRequest;
import com.example.starter_project_2025.system.course_assessment_type_weight.dto.CourseWeightResponse;

import java.util.List;
import java.util.UUID;

public interface CourseAssessmentTypeWeightService {

    /**
     * Get all assessment type weights configured for a course.
     */
    List<CourseWeightResponse> getAllByCourse(UUID courseId);

    /**
     * Add a new assessment type weight to a course.
     * Throws if the same assessmentType is already configured for this course.
     */
    CourseWeightResponse create(UUID courseId, CourseWeightRequest request);

    /**
     * Update the weight and/or gradingMethod of an existing configuration.
     */
    CourseWeightResponse update(UUID courseId, UUID weightId, CourseWeightRequest request);

    /**
     * Remove an assessment type weight from a course.
     */
    void delete(UUID courseId, UUID weightId);
}
