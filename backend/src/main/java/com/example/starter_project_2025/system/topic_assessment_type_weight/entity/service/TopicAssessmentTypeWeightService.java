package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.service;

import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightCreateRequest;
import com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto.TopicAssessmentTypeWeightResponse;

import java.util.List;
import java.util.UUID;

public interface TopicAssessmentTypeWeightService
{
    List<TopicAssessmentTypeWeightResponse> getWeightsByTopicId(UUID topicId);

    List<TopicAssessmentTypeWeightResponse> createAndUpdateWeightsByTopicId(UUID topicId, List<TopicAssessmentTypeWeightCreateRequest> request);
}
