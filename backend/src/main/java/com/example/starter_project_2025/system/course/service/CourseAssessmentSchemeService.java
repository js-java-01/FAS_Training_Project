package com.example.starter_project_2025.system.course.service;

import com.example.starter_project_2025.system.course.dto.CourseAssessmentComponentRequest;
import com.example.starter_project_2025.system.course.dto.CourseAssessmentComponentResponse;
import com.example.starter_project_2025.system.course.dto.CourseAssessmentSchemeConfigDTO;

import java.util.List;
import java.util.UUID;

public interface CourseAssessmentSchemeService {

    CourseAssessmentSchemeConfigDTO getSchemeConfig(UUID courseId);

    void updateSchemeConfig(UUID courseId,
                            CourseAssessmentSchemeConfigDTO dto);

    List<CourseAssessmentComponentResponse> getComponents(UUID courseId);

    void updateComponents(UUID courseId,
                          List<CourseAssessmentComponentRequest> request);

    void deleteComponent(UUID courseId, UUID componentId);

    void cloneFromTopic(UUID topicId, UUID courseId);

}
