package com.example.starter_project_2025.system.assessment.dto.assessment_type.request;

import jakarta.validation.constraints.Size;


public record UpdateAssessmentTypeRequest(
    @Size(min = 5, max = 255)
    String name,

    @Size(min = 10, max = 250)
    String description
    ){
}
