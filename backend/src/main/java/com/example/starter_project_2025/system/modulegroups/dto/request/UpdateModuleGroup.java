package com.example.starter_project_2025.system.modulegroups.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateModuleGroup {

    @NotBlank(message = "Module group name is required")
    @Size(max = 100, message = "Module group name must not exceed 100 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private Integer displayOrder;

    private Boolean isActive;
}
