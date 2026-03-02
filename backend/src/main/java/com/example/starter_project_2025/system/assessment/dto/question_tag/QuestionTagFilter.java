package com.example.starter_project_2025.system.assessment.dto.question_tag;

import com.example.starter_project_2025.base.enums.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.util.List;

@Builder
public record QuestionTagFilter(

        @FilterField(entityField = "id")
        Long id,

        @FilterField(entityField = "name", operator = FilterOperator.LIKE)
        String name,

        @FilterField(entityField = "description", operator = FilterOperator.LIKE)
        String description,

        @FilterField(entityField = "questions.id", operator = FilterOperator.IN)
        List<Long> questionIds

) {
}
