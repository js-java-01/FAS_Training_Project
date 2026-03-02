package com.example.starter_project_2025.system.assessment.dto.assessment_type;

import com.example.starter_project_2025.base.enums.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
public record AssessmentTypeFilter(

        @FilterField(entityField = "id")
        UUID id,

        @FilterField(entityField = "name", operator = FilterOperator.LIKE)
        String name,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDate> createdRange,

        @FilterField(entityField = "updatedAt", operator = FilterOperator.BETWEEN)
        List<LocalDate> updatedRange
) {
}