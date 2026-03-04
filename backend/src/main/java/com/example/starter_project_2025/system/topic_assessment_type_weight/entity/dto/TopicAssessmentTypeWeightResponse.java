package com.example.starter_project_2025.system.topic_assessment_type_weight.entity.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class TopicAssessmentTypeWeightResponse
{
    private UUID id;
    private String accessmentTypeName;
    private Double weight;
}
