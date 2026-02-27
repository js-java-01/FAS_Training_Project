package com.example.starter_project_2025.system.assessment.dto.assessmentType.response;

import lombok.Data;

import java.time.LocalDate;
@Data
public class AssessmentTypeDTO {
    private String id;
    private String name;
    private String description;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
