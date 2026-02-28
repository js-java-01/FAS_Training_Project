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
import com.example.starter_project_2025.system.modulegroups.util.StringNormalizer;
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
            Pageable pageable) {
        Page<Module> page = moduleRepository.search(
                keyword,
                moduleGroupId,
                isActive,
                pageable);

        return page.map(moduleMapper::toDetailResponse);
    }

    @Override
    public ModuleDetail getModuleDetail(UUID id) {

        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));

        return moduleMapper.toDetailResponse(module);
    }

    @Override
    public CreateModuleResponse createModule(CreateModuleRequest req) {
        if (moduleRepository.existsByUrl(req.getUrl())) {
            throw new BadRequestException("The URL '" + req.getUrl() + "' already exists in the system.");
        }

        if (moduleGroupsRepository.existsByNameIgnoreCase(req.getTitle().trim())) {
            throw new BadRequestException(
                    "Module name cannot be the same as an existing Module Group name: '" + req.getTitle() + "'");
        }

        ModuleGroups group = moduleGroupsRepository.findById(req.getModuleGroupId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ModuleGroupResponse", "id", req.getModuleGroupId()));

        validateModuleNameNotSameAsGroup(req.getTitle(), group.getName());

        String title = StringNormalizer.normalize(req.getTitle());
        String url;
        try {
            url = StringNormalizer.normalizeUrl(req.getUrl());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(e.getMessage());
        }

        if (moduleRepository.existsByModuleGroupIdAndTitle(
                req.getModuleGroupId(), title)) {
            throw new BadRequestException(
                    "Module name already exists in this module group");
        }

        if (moduleRepository.existsByModuleGroupIdAndUrl(
                req.getModuleGroupId(), url)) {
            throw new BadRequestException(
                    "Module URL already exists in this module group");
        }

        Module module = moduleMapper.toEntity(req, group);
        module.setTitle(title);
        module.setUrl(url);

        Module saved = moduleRepository.saveAndFlush(module);

        return moduleMapper.toCreateResponse(saved);
    }



    @Transactional
    public UpdateModuleResponse updateModule(UUID moduleId, UpdateModuleRequest req) {

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found"));

        if (!module.getUrl().equals(req.getUrl()) &&
                moduleRepository.existsByUrlAndIdNot(req.getUrl(), moduleId)) {
            throw new BadRequestException("The URL '" + req.getUrl() + "' is already used by another module.");
        }

        if (moduleGroupsRepository.existsByNameIgnoreCase(req.getTitle().trim())) {
            throw new BadRequestException(
                    "Module name cannot be the same as an existing Module Group name: '" + req.getTitle() + "'");
        }

        ModuleGroups group = module.getModuleGroup();
        if (!req.getModuleGroupId().equals(group.getId())) {
            group = moduleGroupsRepository.findById(req.getModuleGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Module Group not found"));
        }

        validateModuleNameNotSameAsGroup(req.getTitle(), group.getName());

        String title = StringNormalizer.normalize(req.getTitle());
        String url;
        try {
            url = StringNormalizer.normalizeUrl(req.getUrl());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(e.getMessage());
        }

        if (!module.getTitle().equals(title)
                && moduleRepository.existsByModuleGroupIdAndTitle(
                        req.getModuleGroupId(), title)) {
            throw new BadRequestException(
                    "Module name already exists in this module group");
        }

        if (!module.getUrl().equals(url)
                && moduleRepository.existsByModuleGroupIdAndUrl(
                        req.getModuleGroupId(), url)) {
            throw new BadRequestException(
                    "Module URL already exists in this module group");
        }

        module.setTitle(title);
        module.setUrl(url);
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

    private void validateModuleNameNotSameAsGroup(String moduleName, String groupName) {
        if (moduleName != null && moduleName.trim().equalsIgnoreCase(groupName.trim())) {
            throw new BadRequestException("Module name cannot be the same as Module Group name: " + groupName);
        }
    }
}
