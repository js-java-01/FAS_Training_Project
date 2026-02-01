package com.example.starter_project_2025.system.modulegroups.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateModuleRequest{

    @NotBlank(message = "Module name is required")
    private String title;

    @NotBlank(message = "URL is required")
    private String url;

    private String icon;

    private String description;

    @NotNull(message = "Module group is required")
    private UUID moduleGroupId;

    private Integer displayOrder = 0;

    private String requiredPermission;

    private Boolean isActive = true;
}
