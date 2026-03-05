package com.example.starter_project_2025.system.assessment_mgt.assessment;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record AssessmentFilter(

        @FilterField(entityField = "code", operator = FilterOperator.LIKE)
        String code,

        @FilterField(entityField = "title", operator = FilterOperator.LIKE)
        String title,

        @FilterField(entityField = "difficulty")
        AssessmentDifficulty difficulty,

        @FilterField(entityField = "status")
        AssessmentStatus status,

        @FilterField(entityField = "assessmentType.id")
        Long assessmentTypeId,

        @FilterField(entityField = "programmingLanguage.id")
        Long programmingLanguageId,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDateTime> createdRange

) {}
