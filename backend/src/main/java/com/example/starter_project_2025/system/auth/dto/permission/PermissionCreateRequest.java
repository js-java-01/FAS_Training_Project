package com.example.starter_project_2025.system.auth.dto.permission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record PermissionCreateRequest(

        @NotBlank(message = "Permission name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description,

        @NotBlank(message = "Resource is required")
        @Size(max = 50, message = "Resource must not exceed 50 characters")
        String resource,

        @NotBlank(message = "Action is required")
        @Size(max = 50, message = "Action must not exceed 50 characters")
        String action,

        @NotNull(message = "Active status is required")
        Boolean isActive
) {
}
