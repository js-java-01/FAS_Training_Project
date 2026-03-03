package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentSchemeConfigDTO;
import org.springframework.web.multipart.MultipartFile;

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

    byte[] exportComponents(UUID courseId);

    ImportResultResponse importComponents(UUID courseId, MultipartFile file);

    byte[] downloadComponentsTemplate();

}
