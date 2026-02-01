package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleGroup;
import com.example.starter_project_2025.system.modulegroups.dto.request.UpdateModuleGroup;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupDetailResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupResponse;

import java.util.List;
import java.util.UUID;

public interface ModuleGroupsService {

    ModuleGroupDetailResponse update(UUID id, UpdateModuleGroup request);

    ModuleGroupDetailResponse getDetailById(UUID id);

    ModuleGroupResponse create(CreateModuleGroup request);

    void delete(UUID id);

    List<ModuleGroupDetailResponse> getAll();

    List<ModuleGroupDetailResponse> getAllDetails(); // sidebar (with modules)
    List<ModuleGroupDetailResponse> getActiveGroupsWithActiveModules();


}
