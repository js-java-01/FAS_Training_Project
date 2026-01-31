package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.modulegroups.dto.ModuleGroupsDTO;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
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
public class ModuleGroupServiceImpl implements ModuleGroupsService {

    private final ModuleGroupsRepository moduleGroupsRepository;

    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_READ')")
    public Page<ModuleGroupsDTO> getAll(Pageable pageable) {
        return moduleGroupsRepository.findAll(pageable)
                .map(this::toDTO);
    }

    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_READ')")
    public List<ModuleGroupsDTO> getAllList() {
        return moduleGroupsRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ModuleGroupsDTO> getActive() {
        return moduleGroupsRepository.findActiveModuleGroupsWithModules()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_READ')")
    public ModuleGroupsDTO getById(UUID id) {
        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroup", "id", id)
                );
        return toDTO(group);
    }

    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_CREATE')")
    public ModuleGroupsDTO create(ModuleGroupsDTO dto) {
        if (moduleGroupsRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Module group name already exists: " + dto.getName());
        }
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("Module group name is required");
        }

        ModuleGroups group = new ModuleGroups();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setDisplayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0);
        group.setIsActive(true);

        return toDTO(moduleGroupsRepository.save(group));
    }

    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_UPDATE')")
    public ModuleGroupsDTO update(UUID id, ModuleGroupsDTO dto) {
        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroup", "id", id)
                );

        if (dto.getName() != null && !dto.getName().equals(group.getName())) {
            if (moduleGroupsRepository.existsByName(dto.getName())) {
                throw new BadRequestException("Module group name already exists: " + dto.getName());
            }
            group.setName(dto.getName());
        }

        if (dto.getDescription() != null) {
            group.setDescription(dto.getDescription());
        }

        if (dto.getDisplayOrder() != null) {
            group.setDisplayOrder(dto.getDisplayOrder());
        }

        return toDTO(moduleGroupsRepository.save(group));
    }

    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_DELETE')")
    public void delete(UUID id) {

        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroup", "id", id)
                );

        if (group.getModules() != null && !group.getModules().isEmpty()) {
            throw new BadRequestException(
                    "Cannot delete module group because it still contains modules"
            );
        }

        moduleGroupsRepository.delete(group);
    }


    @Override
    @PreAuthorize("hasAuthority('MODULE_GROUP_UPDATE')")
    public ModuleGroupsDTO toggleStatus(UUID id) {
        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroup", "id", id)
                );
        group.setIsActive(!group.getIsActive());
        return toDTO(moduleGroupsRepository.save(group));
    }

    private ModuleGroupsDTO toDTO(ModuleGroups group) {
        ModuleGroupsDTO dto = new ModuleGroupsDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setDisplayOrder(group.getDisplayOrder());
        dto.setTotalModules(
                group.getModules() != null ? group.getModules().size() : 0
        );
        dto.setIsActive(group.getIsActive());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());

        return dto;
    }
}
