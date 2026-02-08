package com.example.starter_project_2025.system.modulegroups.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ModuleGroupResponse {

    private UUID id;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer displayOrder;

    private Integer totalModules;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
