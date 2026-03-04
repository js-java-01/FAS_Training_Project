package com.example.starter_project_2025.system.assessment.assessment;

import com.example.starter_project_2025.base.enums.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import com.example.starter_project_2025.system.assessment.assessment.enums.AssessmentDifficulty;
import com.example.starter_project_2025.system.assessment.assessment.enums.AssessmentStatus;
import com.example.starter_project_2025.system.assessment.assessment.enums.GradingMethod;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record AssessmentFilter(

        @FilterField(entityField = "status")
        AssessmentStatus status,

        @FilterField(entityField = "difficulty")
        AssessmentDifficulty difficulty,

        @FilterField(entityField = "gradingMethod")
        GradingMethod gradingMethod,

        @FilterField(entityField = "assessmentType.id")
        UUID assessmentTypeId,

        @FilterField(entityField = "title", operator = FilterOperator.LIKE)
        String title,

        @FilterField(entityField = "code", operator = FilterOperator.LIKE)
        String code,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDateTime> createdRange,

        @FilterField(entityField = "totalScore", operator = FilterOperator.BETWEEN)
        List<Integer> scoreRange

) {
}
