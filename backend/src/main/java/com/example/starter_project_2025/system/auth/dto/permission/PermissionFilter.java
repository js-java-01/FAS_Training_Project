package com.example.starter_project_2025.system.auth.dto.permission;

import com.example.starter_project_2025.base.enums.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record PermissionFilter(

        @FilterField(entityField = "isActive")
        Boolean isActive,

        @FilterField(entityField = "resource", operator = FilterOperator.LIKE)
        String resource,

        @FilterField(entityField = "action", operator = FilterOperator.LIKE)
        String action,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        LocalDateTime createdRange

) {}
