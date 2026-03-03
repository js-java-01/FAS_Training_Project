package com.example.starter_project_2025.system.course_online.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CourseAssessmentSchemeDTO {

    private CourseAssessmentSchemeConfigDTO config;

    private List<CourseAssessmentComponentResponse> components;

    private Double totalWeight;
}