package com.example.starter_project_2025.system.user.dto;

import com.example.starter_project_2025.base.enums.FilterOperator;
import com.example.starter_project_2025.base.spec.FilterField;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record UserFilter(

        @FilterField(entityField = "isActive")
        Boolean isActive,

        @FilterField(entityField = "userRoles.role.id", operator = FilterOperator.IN)
        List<UUID> roleIds,

        @FilterField(entityField = "createdAt", operator = FilterOperator.BETWEEN)
        List<LocalDateTime> createdRange
) {

}
