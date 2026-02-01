package com.example.starter_project_2025.system.modulegroups.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ModuleGroupDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private Integer totalModules;
    private List<ModuleDetail> modules;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
