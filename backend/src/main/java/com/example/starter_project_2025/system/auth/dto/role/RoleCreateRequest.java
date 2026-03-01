package com.example.starter_project_2025.system.auth.dto.role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.Set;
import java.util.UUID;

@Builder
public record RoleCreateRequest(

        @NotBlank(message = "Role name is required")
        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description,

        @NotNull(message = "Active status is required")
        Boolean isActive,

        @NotNull(message = "Permission IDs are required")
        Set<UUID> permissionIds
) {
}
