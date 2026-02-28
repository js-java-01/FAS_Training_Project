package com.example.starter_project_2025.system.auth.dto.role;

import lombok.Builder;

import java.util.Set;
import java.util.UUID;

@Builder
public record RoleUpdateRequest(

        String name,

        String description,

        Boolean isActive,

        Set<UUID> permissionIds
) {
}
