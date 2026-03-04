package com.example.starter_project_2025.system.programming_language;

import com.example.starter_project_2025.base.crud.dto.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record ProgrammingLanguageFilter(

        @FilterField(entityField = "isSupported")
        Boolean isSupported,

        @FilterField(entityField = "name", operator = FilterOperator.LIKE)
        String name,

        @FilterField(entityField = "version", operator = FilterOperator.LIKE)
        String version,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDateTime> createdRange

) {}