package com.example.starter_project_2025.system.modulegroups.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class    ModuleDetail {

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

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

