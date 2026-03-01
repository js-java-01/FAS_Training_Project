package com.example.starter_project_2025.system.topic.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssessmentSchemeConfigDTO {

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Double minGpaToPass;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Integer minAttendance;

    @NotNull
    private Boolean allowFinalRetake;
}