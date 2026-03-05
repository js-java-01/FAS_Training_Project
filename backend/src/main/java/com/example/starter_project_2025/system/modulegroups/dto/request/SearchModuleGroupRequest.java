package com.example.starter_project_2025.system.modulegroups.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class SearchModuleGroupRequest {

    private int page = 0;
    private int size = 20;
    @Schema (example = "[\"displayOrder\", \"asc\"]")
    private String[] sort = new String[]{"displayOrder", "asc"};
    @Schema(example = "a")
    private String keyword;
    @Schema (example = "true")
    private Boolean isActive;
}