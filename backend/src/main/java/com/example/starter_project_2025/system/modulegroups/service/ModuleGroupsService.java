package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.system.modulegroups.dto.ModuleGroupsDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ModuleGroupsService {

    Page<ModuleGroupsDTO> getAll(Pageable pageable);

    List<ModuleGroupsDTO> getAllList();

    List<ModuleGroupsDTO> getActive();

    ModuleGroupsDTO getById(UUID id);

    ModuleGroupsDTO create(ModuleGroupsDTO dto);

    ModuleGroupsDTO update(UUID id, ModuleGroupsDTO dto);

    void delete(UUID id);

    ModuleGroupsDTO toggleStatus(UUID id);
}
