package com.example.starter_project_2025.system.assessment_mgt.question;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
public record QuestionFilter(

        @FilterField(entityField = "content", operator = FilterOperator.LIKE)
        String content,

        @FilterField(entityField = "questionType")
        String questionType,

        @FilterField(entityField = "isActive")
        Boolean isActive,

        @FilterField(entityField = "category.id")
        UUID categoryId,

        @FilterField(entityField = "tags.id", operator = FilterOperator.IN)
        Set<Long> tagIds,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDate> createdRange

) {}