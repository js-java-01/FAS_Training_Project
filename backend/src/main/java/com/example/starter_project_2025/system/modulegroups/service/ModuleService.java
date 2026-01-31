package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.ModuleDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ModuleService {

    Page<ModuleDTO> getAllModules(Pageable pageable);

    List<ModuleDTO> getModulesByMenu(UUID menuId);

    List<ModuleDTO> getRootModules(UUID menuId);

    List<ModuleDTO> getChildModules(UUID parentId);

    ModuleDTO getModuleById(UUID id);

    ModuleDTO createModule(ModuleDTO dto);

    ModuleDTO updateModule(UUID id, ModuleDTO dto);

    void deleteModule(UUID id);

    ModuleDTO toggleModuleStatus(UUID id);
}
