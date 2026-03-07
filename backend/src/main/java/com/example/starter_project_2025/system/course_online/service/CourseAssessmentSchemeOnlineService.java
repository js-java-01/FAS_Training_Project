package com.example.starter_project_2025.system.course_online.service;

import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineRequest;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentComponentOnlineResponse;
import com.example.starter_project_2025.system.course_online.dto.CourseAssessmentSchemeOnlineConfigDTO;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CourseAssessmentSchemeOnlineService {

    CourseAssessmentSchemeOnlineConfigDTO getSchemeConfig(UUID courseId);

    void updateSchemeConfig(UUID courseId,
            CourseAssessmentSchemeOnlineConfigDTO dto);

    List<CourseAssessmentComponentOnlineResponse> getComponents(UUID courseId);

    void updateComponents(UUID courseId,
            List<CourseAssessmentComponentOnlineRequest> request);

    void deleteComponent(UUID courseId, UUID componentId);

    void cloneFromTopic(UUID topicId, UUID courseId);

    byte[] exportComponents(UUID courseId);

    ImportResultResponse importComponents(UUID courseId, MultipartFile file);

    byte[] downloadComponentsTemplate();

}
