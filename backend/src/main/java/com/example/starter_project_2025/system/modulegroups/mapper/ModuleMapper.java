package com.example.starter_project_2025.system.modulegroups.mapper;

import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.response.CreateModuleResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.UpdateModuleResponse;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import org.springframework.stereotype.Component;

@Component
public class ModuleMapper {

    public ModuleDetail toDetailResponse(Module module) {
        return ModuleDetail.builder()
                .id(module.getId())
                .title(module.getTitle())
                .url(module.getUrl())
                .icon(module.getIcon())
                .description(
                        module.getDescription() != null
                                ? module.getDescription()
                                : "No description provided"
                )
                .moduleGroupId(module.getModuleGroup().getId())
                .moduleGroupName(module.getModuleGroup().getName())
                .displayOrder(module.getDisplayOrder())
                .isActive(module.getIsActive())
                .requiredPermission(module.getRequiredPermission())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }


    public Module toEntity(CreateModuleRequest req, ModuleGroups group) {
        Module module = new Module();
        module.setTitle(req.getTitle());
        module.setUrl(req.getUrl());
        module.setIcon(req.getIcon());
        module.setDescription(req.getDescription());
        module.setModuleGroup(group);
        module.setDisplayOrder(
                req.getDisplayOrder() != null ? req.getDisplayOrder() : 0
        );
        module.setIsActive(
                req.getIsActive() != null ? req.getIsActive() : true
        );
        module.setRequiredPermission(req.getRequiredPermission());
        return module;
    }


    public CreateModuleResponse toCreateResponse(Module module) {
        CreateModuleResponse res = new CreateModuleResponse();
        res.setId(module.getId());
        res.setTitle(module.getTitle());
        res.setUrl(module.getUrl());
        res.setIcon(module.getIcon());
        res.setDescription(module.getDescription());
        res.setModuleGroupId(module.getModuleGroup().getId());
        res.setModuleGroupName(module.getModuleGroup().getName());
        res.setDisplayOrder(module.getDisplayOrder());
        res.setIsActive(module.getIsActive());
        res.setRequiredPermission(module.getRequiredPermission());
        res.setCreatedAt(module.getCreatedAt());
        return res;
    }

    public UpdateModuleResponse toUpdateResponse(Module module) {
        return UpdateModuleResponse.builder()
                .id(module.getId())
                .title(module.getTitle())
                .url(module.getUrl())
                .icon(module.getIcon())
                .description(module.getDescription())
                .moduleGroupId(module.getModuleGroup().getId())
                .moduleGroupName(module.getModuleGroup().getName())
                .displayOrder(module.getDisplayOrder())
                .isActive(module.getIsActive())
                .requiredPermission(module.getRequiredPermission())
                .updatedAt(module.getUpdatedAt())
                .build();
    }

}
