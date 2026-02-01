package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.request.UpdateModuleRequest;
import com.example.starter_project_2025.system.modulegroups.dto.response.CreateModuleResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleDetail;
import com.example.starter_project_2025.system.modulegroups.dto.response.UpdateModuleResponse;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.mapper.ModuleMapper;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ModuleServiceImpl implements ModuleService {

    private final ModuleRepository moduleRepository;
    private final ModuleGroupsRepository moduleGroupsRepository;
    private final ModuleMapper moduleMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ModuleDetail> searchModules(
            String keyword,
            UUID moduleGroupId,
            Boolean isActive,
            Pageable pageable
    ) {
        Page<Module> page = moduleRepository.search(
                keyword,
                moduleGroupId,
                isActive,
                pageable
        );

        return page.map(moduleMapper::toDetailResponse);
    }


    @Override
    public ModuleDetail getModuleDetail(UUID id) {

        Module module = moduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Module", "id", id)
                );

        return moduleMapper.toDetailResponse(module);
    }

    @Override
    public CreateModuleResponse createModule(CreateModuleRequest req) {

        ModuleGroups group = moduleGroupsRepository.findById(req.getModuleGroupId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "ModuleGroupResponse", "id", req.getModuleGroupId()
                        )
                );
        if (moduleRepository.existsByModuleGroupIdAndTitle(
                req.getModuleGroupId(), req.getTitle()
        )) {
            throw new BadRequestException(
                    "Module name already exists in this module group"
            );
        }
        Module module = moduleMapper.toEntity(req, group);
        Module saved = moduleRepository.saveAndFlush(module);

        return moduleMapper.toCreateResponse(saved);
    }



    @Transactional
    public UpdateModuleResponse updateModule(UUID moduleId, UpdateModuleRequest req) {

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));
        ModuleGroups group = moduleGroupsRepository.findById(req.getModuleGroupId())
                .orElseThrow(() -> new ResourceNotFoundException("Module Group not found"));

        module.setTitle(req.getTitle());
        module.setUrl(req.getUrl());
        module.setIcon(req.getIcon());
        module.setDescription(req.getDescription());
        module.setModuleGroup(group);
        module.setDisplayOrder(req.getDisplayOrder());
        module.setIsActive(req.getIsActive());
        module.setRequiredPermission(req.getRequiredPermission());

        moduleRepository.save(module);

        return moduleMapper.toUpdateResponse(module);
    }

    @Override
    public List<ModuleDetail> getModulesByGroupId(UUID groupId) {
        // Optional: Verify if the group exists
        if (!moduleGroupsRepository.existsById(groupId)) {
            throw new ResourceNotFoundException("ModuleGroup", "id", groupId);
        }

        // Use the existing repository method to find modules by group ID
        return moduleRepository.findByModuleGroupIdOrderByDisplayOrderAsc(groupId)
                .stream()
                .map(moduleMapper::toDetailResponse) // Convert Entity to DTO
                .toList();
    }

    @Transactional
    public void deleteModule(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        if (!module.getIsActive()) {
            throw new BadRequestException("Module is already inactive");
        }

        module.setIsActive(false);
        moduleRepository.save(module);
    }

}
