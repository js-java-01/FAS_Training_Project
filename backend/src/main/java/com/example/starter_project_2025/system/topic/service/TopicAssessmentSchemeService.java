package com.example.starter_project_2025.system.topic.service;

import com.example.starter_project_2025.system.topic.dto.AssessmentComponentRequest;
import com.example.starter_project_2025.system.topic.dto.AssessmentComponentResponse;
import com.example.starter_project_2025.system.topic.dto.AssessmentSchemeConfigDTO;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface TopicAssessmentSchemeService {

    AssessmentSchemeConfigDTO getSchemeConfig(UUID topicId);

    AssessmentSchemeConfigDTO updateSchemeConfig(UUID topicId, AssessmentSchemeConfigDTO dto);

    List<AssessmentComponentResponse> getComponents(UUID topicId);

    AssessmentComponentResponse addComponent(UUID topicId, AssessmentComponentRequest request);

    List<AssessmentComponentResponse> updateComponents(UUID topicId, List<AssessmentComponentRequest> request);

    void deleteComponent(UUID topicId, UUID componentId);

    Double getTotalWeight(UUID topicId);

    byte[] exportComponents(UUID topicId);

    ImportResultResponse importComponents(UUID topicId, MultipartFile file);

    byte[] downloadComponentsTemplate();
}