package com.example.starter_project_2025.system.assessment.dto.assessmentType.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAssessmentTypeRequest {
    @NotBlank(message = "name is required")
    @Size(min = 5, max = 255)
    private String name;

    @Size(min = 10, max = 250)
    private String description;
}
