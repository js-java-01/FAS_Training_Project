package com.example.starter_project_2025.system.modulegroups.service;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleGroup;
import com.example.starter_project_2025.system.modulegroups.dto.request.UpdateModuleGroup;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupDetailResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupResponse;
import com.example.starter_project_2025.system.modulegroups.entity.ModuleGroups;
import com.example.starter_project_2025.system.modulegroups.mapper.ModuleGroupMapper;
import com.example.starter_project_2025.system.modulegroups.repository.ModuleGroupsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ModuleGroupServiceImpl implements ModuleGroupsService {

    private final ModuleGroupsRepository moduleGroupsRepository;
    private final ModuleGroupMapper moduleGroupMapper;

    @Override
    public List<ModuleGroupDetailResponse> getAll() {
        return moduleGroupsRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(g -> moduleGroupMapper.toResponse(g, false))
                .toList();
    }


    @Override
    public List<ModuleGroupDetailResponse> getAllDetails() {
        return moduleGroupsRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(g -> moduleGroupMapper.toResponse(g, true))
                .toList();
    }


    @Override
    public ModuleGroupDetailResponse getDetailById(UUID id) {

        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroupResponse", "id", id)
                );

        return moduleGroupMapper.toResponse(group, true);
    }

    @Override
    public ModuleGroupResponse create(CreateModuleGroup req) {

        if (moduleGroupsRepository.existsByName(req.getName())) {
            throw new BadRequestException(
                    "Module group name already exists: " + req.getName()
            );
        }

        ModuleGroups entity = new ModuleGroups();
        entity.setName(req.getName());
        entity.setDescription(req.getDescription());
        entity.setDisplayOrder(
                req.getDisplayOrder() != null ? req.getDisplayOrder() : 0
        );
        entity.setIsActive(
                req.getIsActive() != null ? req.getIsActive() : true
        );

        ModuleGroups saved = moduleGroupsRepository.save(entity);

        return moduleGroupMapper.toResponse(saved);
    }

    @Override
    public ModuleGroupDetailResponse update(UUID id, UpdateModuleGroup req) {

        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroupResponse", "id", id)
                );

        if (!group.getName().equals(req.getName())
                && moduleGroupsRepository.existsByName(req.getName())) {
            throw new BadRequestException(
                    "Module group name already exists: " + req.getName()
            );
        }

        group.setName(req.getName());
        group.setDescription(req.getDescription());
        group.setDisplayOrder(
                req.getDisplayOrder() != null ? req.getDisplayOrder() : group.getDisplayOrder()
        );
        group.setIsActive(
                req.getIsActive() != null ? req.getIsActive() : group.getIsActive()
        );

        ModuleGroups saved = moduleGroupsRepository.save(group);

        return moduleGroupMapper.toDetailResponse(saved);
    }


    @Override
    @Transactional
    public void delete(UUID id) {

        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("ModuleGroup", "id", id));

        if (Boolean.FALSE.equals(group.getIsActive())) {
            throw new BadRequestException("Module group is already inactive");
        }

        if (group.getModules() != null) {
            group.getModules().forEach(module -> module.setIsActive(false));
        }
        group.setIsActive(false);

        moduleGroupsRepository.save(group);
    }

    @Override
    public List<ModuleGroupDetailResponse> getActiveGroupsWithActiveModules() {
        return moduleGroupsRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(moduleGroupMapper::toActiveResponse)
                .filter(res -> res.getTotalModules() > 0) // optional: hide empty group
                .toList();
    }

}
