package com.example.starter_project_2025.system.assessment.dto.assessment_type.response;

import lombok.Data;

import java.time.LocalDate;
@Data
public class AssessmentTypeResponse {
    private String id;
    private String name;
    private String description;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
