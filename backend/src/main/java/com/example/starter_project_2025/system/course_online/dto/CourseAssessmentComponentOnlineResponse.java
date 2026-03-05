package com.example.starter_project_2025.system.course_online.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

import com.example.starter_project_2025.system.course_online.enums.AssessmentTypeOnline;

@Data
@Builder
public class CourseAssessmentComponentOnlineResponse {

    private UUID id;

    private AssessmentTypeOnline type;

    private String name;

    private Integer count;

    private Double weight;

    private Integer duration;

    private Integer displayOrder;

    private Boolean graded;
}