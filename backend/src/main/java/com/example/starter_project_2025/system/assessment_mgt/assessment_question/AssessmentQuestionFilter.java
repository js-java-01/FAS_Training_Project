package com.example.starter_project_2025.system.assessment_mgt.assessment_question;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record AssessmentQuestionFilter(

        @FilterField(entityField = "assessment.id")
        UUID assessmentId,

        @FilterField(entityField = "question.id")
        UUID questionId,

        @FilterField(entityField = "score", operator = FilterOperator.BETWEEN)
        List<Double> scoreRange,

        @FilterField(entityField = "orderIndex")
        Integer orderIndex

) {
}