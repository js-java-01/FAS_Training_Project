package com.example.starter_project_2025.system.modulegroups.dto.request;

import lombok.Data;

import java.util.UUID;

@Data
public class SearchModuleRequest {

    private String keyword;
    private UUID moduleGroupId;
    private Boolean isActive;
}