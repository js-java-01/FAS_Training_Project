package com.example.starter_project_2025.system.auth.dto.role;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
public class RoleDTO {
    private UUID id;

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;
//    private Integer hierarchyLevel = 0;
    private Boolean isActive = true;
    private Set<UUID> permissionIds = new HashSet<>();
    private Set<String> permissionNames = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
