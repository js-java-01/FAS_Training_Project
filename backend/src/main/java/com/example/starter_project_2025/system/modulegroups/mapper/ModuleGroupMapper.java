package com.example.starter_project_2025.system.modulegroups.mapper;

import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupDetailResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupResponse;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleDetail;

import org.springframework.stereotype.Component;

import java.util.Comparator;

@Component
public class ModuleGroupMapper {


    public ModuleGroupResponse toResponse(ModuleGroups entity) {
        ModuleGroupResponse res = new ModuleGroupResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setDescription(entity.getDescription());
        res.setIsActive(entity.getIsActive());
        res.setDisplayOrder(entity.getDisplayOrder());
        res.setTotalModules(
                entity.getModules() != null ? entity.getModules().size() : 0
        );
        res.setCreatedAt(entity.getCreatedAt());
        res.setUpdatedAt(entity.getUpdatedAt());
        return res;
    }

    public ModuleGroupDetailResponse toDetailResponse(ModuleGroups group) {
        ModuleGroupDetailResponse res = new ModuleGroupDetailResponse();
        res.setId(group.getId());
        res.setName(group.getName());
        res.setDescription(group.getDescription());
        res.setIsActive(group.getIsActive());
        res.setDisplayOrder(group.getDisplayOrder());
        res.setTotalModules(
                group.getModules() != null ? group.getModules().size() : 0
        );
        res.setCreatedAt(group.getCreatedAt());
        res.setUpdatedAt(group.getUpdatedAt());
        return res;
    }


    public ModuleGroupDetailResponse toResponse(ModuleGroups group, boolean includeModules) {

        ModuleGroupDetailResponse res = new ModuleGroupDetailResponse();
        res.setId(group.getId());
        res.setName(group.getName());
        res.setDescription(group.getDescription());
        res.setIsActive(group.getIsActive());
        res.setDisplayOrder(group.getDisplayOrder());
        res.setTotalModules(
                group.getModules() != null ? group.getModules().size() : 0
        );
        res.setCreatedAt(group.getCreatedAt());
        res.setUpdatedAt(group.getUpdatedAt());

        if (includeModules) {
            res.setModules(
                    group.getModules().stream()
                            .map(this::toModuleInGroup)
                            .toList()
            );
        }

        return res;
    }



    private ModuleDetail toModuleDetail(Module module) {
        return ModuleDetail.builder()
                .id(module.getId())
                .title(module.getTitle())
                .url(module.getUrl())
                .icon(module.getIcon())
                .description(module.getDescription())
                .displayOrder(module.getDisplayOrder())
                .isActive(module.getIsActive())
                .requiredPermission(module.getRequiredPermission())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .build();
    }


    private ModuleDetail toModuleInGroup(Module module) {
        return ModuleDetail.builder()
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
                .build();
    }
    public ModuleGroupDetailResponse toActiveResponse(ModuleGroups group) {
        ModuleGroupDetailResponse res = new ModuleGroupDetailResponse();
        res.setId(group.getId());
        res.setName(group.getName());
        res.setDescription(group.getDescription());

        if (group.getModules() != null) {
            var activeModules = group.getModules()
                    .stream()
                    .filter(m -> Boolean.TRUE.equals(m.getIsActive()))
                    .sorted(Comparator.comparingInt(m ->
                            m.getDisplayOrder() != null ? m.getDisplayOrder() : 0
                    ))
                    .map(this::toModuleDetail)
                    .toList();

            res.setModules(activeModules);
            res.setTotalModules(activeModules.size());
        } else {
            res.setTotalModules(0);
        }

        return res;
    }

}
