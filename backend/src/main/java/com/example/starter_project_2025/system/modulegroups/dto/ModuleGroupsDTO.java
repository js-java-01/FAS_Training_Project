package com.example.starter_project_2025.system.modulegroups.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class ModuleGroupsDTO {
    private UUID id;

    @NotBlank(message = "Module group name is required")
    private String name;

    private String description;
    private Boolean isActive = true;
    private Integer displayOrder = 0;
    private List<ModuleDTO> module = new ArrayList<>();
    private Integer totalModules;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
