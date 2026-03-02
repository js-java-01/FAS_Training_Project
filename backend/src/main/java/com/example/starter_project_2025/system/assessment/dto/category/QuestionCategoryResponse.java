package com.example.starter_project_2025.system.assessment.dto.category;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Builder
public record QuestionCategoryResponse (
    UUID id,
    String name,
    String description
) {
}