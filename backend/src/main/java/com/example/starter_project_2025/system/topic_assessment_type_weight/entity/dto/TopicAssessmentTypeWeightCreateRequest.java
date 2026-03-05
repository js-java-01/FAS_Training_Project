package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class TopicAssessmentTypeWeightCreateRequest
{
    private UUID topicId;
    private UUID assessmentTypeId;
    private Double weight;
}
