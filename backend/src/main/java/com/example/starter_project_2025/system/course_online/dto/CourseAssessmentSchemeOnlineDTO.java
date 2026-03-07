package com.example.starter_project_2025.system.course_online.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CourseAssessmentSchemeOnlineDTO {

    private CourseAssessmentSchemeOnlineConfigDTO config;

    private List<CourseAssessmentComponentOnlineResponse> components;

    private Double totalWeight;
}