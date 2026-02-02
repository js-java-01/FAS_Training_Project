package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.request.UpdateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.response.CreateModuleResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.UpdateModuleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ModuleService {

    ModuleDetail getModuleDetail(UUID id);

    List<ModuleDetail> getModulesByGroupId(UUID groupId);

    CreateModuleResponse createModule(CreateModuleRequest request);

    UpdateModuleResponse updateModule(UUID id, UpdateModuleRequest req);

    void deleteModule(UUID id);

    Page<ModuleDetail> searchModules(
            String keyword,
            UUID moduleGroupId,
            Boolean isActive,
            Pageable pageable
    );

}
