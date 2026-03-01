package com.example.starter_project_2025.system.auth.dto.role;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.util.Set;
import java.util.UUID;

@Builder
public record RoleCreateRequest(

        @NotBlank(message = "Role name is required")
        String name,

        String description,

        Set<UUID> permissionIds
) {
}
