package com.example.starter_project_2025.system.course_online.dto;

import com.example.starter_project_2025.system.course_online.enums.AssessmentType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CourseAssessmentComponentRequest {

    @NotNull
    private AssessmentType type;

    @NotBlank
    @Size(max = 255)
    private String name;

    @NotNull
    @Min(1)
    private Integer count;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double weight;

    private Integer duration; // optional

    @NotNull
    @Min(1)
    private Integer displayOrder;

    @NotNull
    private Boolean graded;
}
