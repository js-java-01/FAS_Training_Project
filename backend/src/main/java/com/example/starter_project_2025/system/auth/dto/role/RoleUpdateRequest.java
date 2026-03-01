package com.example.starter_project_2025.system.auth.dto.role;

import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.Set;
import java.util.UUID;

@Builder
public record RoleUpdateRequest(

        @Size(max = 100, message = "Name must not exceed 100 characters")
        String name,

        @Size(max = 255, message = "Description must not exceed 255 characters")
        String description,

        Boolean isActive,

        Set<UUID> permissionIds
) {
}
