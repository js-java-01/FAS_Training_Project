package com.example.starter_project_2025.system.course_online.dto;

import com.example.starter_project_2025.system.course_online.enums.AssessmentType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CourseAssessmentComponentResponse {

    private UUID id;

    private AssessmentType type;

    private String name;

    private Integer count;

    private Double weight;

    private Integer duration;

    private Integer displayOrder;

    private Boolean graded;
}