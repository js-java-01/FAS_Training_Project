package com.example.starter_project_2025.system.modulegroups.dto.request;

import lombok.Data;

@Data
public class SearchModuleGroupRequest {

    private int page = 0;
    private int size = 20;

    private String[] sort = new String[]{"displayOrder", "asc"};

    private String keyword;
    private Boolean isActive;
}