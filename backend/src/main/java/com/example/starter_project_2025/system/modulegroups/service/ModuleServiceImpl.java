package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.modulegroups.dto.ModuleDTO;
import com.example.starter_project_2025.system.modulegroups.entity.Module;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_READ')")
    public Page<ModuleDTO> getAllModules(Pageable pageable) {
        return moduleRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_READ')")
    public List<ModuleDTO> getModulesByMenu(UUID menuId) {
        return moduleRepository.findByModuleGroupIdOrderByDisplayOrderAsc(menuId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_READ')")
    public List<ModuleDTO> getRootModules(UUID menuId) {
        return moduleRepository.findRootModulesByModuleGroupId(menuId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_READ')")
    public List<ModuleDTO> getChildModules(UUID parentId) {
        return moduleRepository.findByParentIdOrderByDisplayOrderAsc(parentId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_READ')")
    public ModuleDTO getModuleById(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Module", "id", id)
                );
        return convertToDTO(module);
    }

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_CREATE')")
    public ModuleDTO createModule(ModuleDTO dto) {

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Module name is required");
        }
        if (dto.getUrl() == null || dto.getUrl().trim().isEmpty()) {
            throw new BadRequestException("Module URL is required");
        }
        if (dto.getModuleGroupsId() == null) {
            throw new BadRequestException("Module group is required");
        }

        ModuleGroups moduleGroup = moduleGroupsRepository.findById(dto.getModuleGroupsId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroup", "id", dto.getModuleGroupsId())
                );

        if (moduleRepository.existsByModuleGroupIdAndTitle(
                dto.getModuleGroupsId(), dto.getTitle())) {
            throw new BadRequestException(
                    "Module name already exists in this module group: " + dto.getTitle()
            );
        }

        Module module = new Module();
        module.setModuleGroup(moduleGroup);
        module.setTitle(dto.getTitle());
        module.setUrl(dto.getUrl());
        module.setIcon(dto.getIcon());
        module.setDescription(dto.getDescription());
        module.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        module.setIsActive(true);
        module.setRequiredPermission(dto.getRequiredPermission());

        if (dto.getParentId() != null) {
            Module parent = moduleRepository.findById(dto.getParentId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Module", "id", dto.getParentId())
                    );
            module.setParent(parent);
        }

        return convertToDTO(moduleRepository.save(module));
    }


    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_UPDATE')")
    public ModuleDTO updateModule(UUID id, ModuleDTO dto) {

        Module module = moduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Module", "id", id)
                );

        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Module name is required");
        }
        if (dto.getUrl() == null || dto.getUrl().trim().isEmpty()) {
            throw new BadRequestException("Module URL is required");
        }
        if (dto.getModuleGroupsId() == null) {
            throw new BadRequestException("Module group is required");
        }

        module.setTitle(dto.getTitle());
        module.setUrl(dto.getUrl());
        module.setIcon(dto.getIcon());
        module.setDescription(dto.getDescription());
        module.setDisplayOrder(dto.getDisplayOrder());
        module.setRequiredPermission(dto.getRequiredPermission());

        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(id)) {
                throw new BadRequestException("Module cannot be its own parent");
            }
            Module parent = moduleRepository.findById(dto.getParentId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Module", "id", dto.getParentId())
                    );
            module.setParent(parent);
        }

        return convertToDTO(moduleRepository.save(module));
    }


    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_DELETE')")
    public void deleteModule(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Module", "id", id)
                );
        moduleRepository.delete(module);
    }

    @Override
    @PreAuthorize("hasAuthority('MENU_ITEM_UPDATE')")
    public ModuleDTO toggleModuleStatus(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Module", "id", id)
                );
        module.setIsActive(!module.getIsActive());
        return convertToDTO(moduleRepository.save(module));
    }

    private ModuleDTO convertToDTO(Module module) {
        ModuleDTO dto = new ModuleDTO();
        dto.setId(module.getId());
        dto.setModuleGroupsId(module.getModuleGroup().getId());
        dto.setParentId(module.getParent() != null ? module.getParent().getId() : null);
        dto.setTitle(module.getTitle());
        dto.setUrl(module.getUrl());
        dto.setIcon(module.getIcon());
        dto.setDescription(
                module.getDescription() != null
                        ? module.getDescription()
                        : "No description provided"
        );
        dto.setDisplayOrder(module.getDisplayOrder());
        dto.setIsActive(module.getIsActive());
        dto.setRequiredPermission(module.getRequiredPermission());
        dto.setCreatedAt(module.getCreatedAt());
        dto.setUpdatedAt(module.getUpdatedAt());
        return dto;
    }

}
