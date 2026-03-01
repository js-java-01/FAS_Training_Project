package com.example.starter_project_2025.system.topic.dto;

import com.example.starter_project_2025.system.topic.enums.AssessmentType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AssessmentComponentRequest {

    @NotBlank
    private String name;

    @NotNull
    private AssessmentType type;

    @NotNull
    @Positive
    private Integer count;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double weight;

    private Integer duration;

    @NotNull
    @Positive
    private Integer displayOrder;

    @NotNull
    private Boolean isGraded;

    private String note;
}