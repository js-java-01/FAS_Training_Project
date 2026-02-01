package com.example.starter_project_2025.system.modulegroups.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateModuleGroup {

    @NotBlank(message = "Module group name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    private Integer displayOrder;

    private Boolean isActive;
}
