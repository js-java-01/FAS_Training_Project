package com.example.starter_project_2025.system.modulegroups.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UpdateModuleResponse {

    private UUID id;

    private String title;
    private String url;
    private String icon;
    private String description;

    private UUID moduleGroupId;
    private String moduleGroupName;


    private Integer displayOrder;
    private Boolean isActive;
    private String requiredPermission;

    private LocalDateTime updatedAt;
}
