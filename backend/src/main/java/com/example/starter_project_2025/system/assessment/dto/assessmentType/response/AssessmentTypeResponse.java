package com.example.starter_project_2025.system.assessment.dto.assessmentType.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;


@Builder
public record AssessmentTypeResponse(
    String id,
    String name,
    String description,
    LocalDate createdAt,
    LocalDate updatedAt
){

}
