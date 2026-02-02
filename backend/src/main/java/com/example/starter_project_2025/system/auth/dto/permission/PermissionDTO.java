package com.example.starter_project_2025.system.auth.dto.permission;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PermissionDTO {
    private UUID id;

    @NotBlank(message = "Permission name is required")
    private String name;

    private String description;

    @NotBlank(message = "Resource is required")
    private String resource;

    @NotBlank(message = "Action is required")
    private String action;

    private LocalDateTime createdAt;
}
