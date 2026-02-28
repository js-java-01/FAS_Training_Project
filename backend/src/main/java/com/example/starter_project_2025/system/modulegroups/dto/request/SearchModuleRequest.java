package com.example.starter_project_2025.system.modulegroups.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.UUID;

@Data
public class SearchModuleRequest {
    @Schema(example = "0")
    private String keyword;
    @Schema(example = "0")
    private UUID moduleGroupId;
    @Schema (example = "true")
    private Boolean isActive;
}