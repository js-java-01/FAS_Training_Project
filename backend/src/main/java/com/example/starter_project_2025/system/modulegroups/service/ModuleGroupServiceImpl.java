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
import com.example.starter_project_2025.system.modulegroups.util.StringNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<ModuleGroupDetailResponse> searchModuleGroups(
            String keyword,
            Boolean isActive,
            Pageable pageable
    ) {
        String kw = keyword == null
                ? null
                : "%" + keyword.toLowerCase() + "%";

        Page<ModuleGroups> page =
                moduleGroupsRepository.search(kw, isActive, pageable);

        return page.map(moduleGroupMapper::toDetailResponse);
    }

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

        String name = StringNormalizer.normalize(req.getName());

        if (moduleGroupsRepository.existsByName(name)) {
            throw new BadRequestException(
                    "Module group name already exists: " + name
            );
        if (moduleGroupsRepository.existsByName(req.getName())) {
            throw new BadRequestException("Module group name already exists: " + req.getName());
        }

        // Validate Order
        long currentCount = moduleGroupsRepository.count();
        int maxAllowed = (int) currentCount + 1;
        int newOrder = (req.getDisplayOrder() != null) ? req.getDisplayOrder() : maxAllowed;

        if (newOrder > maxAllowed) {
            throw new BadRequestException("Display Order cannot exceed " + maxAllowed);
        }
        if (newOrder < 1) newOrder = 1;

        // Create: Chèn vào -> Đôn tất cả những thằng sau nó lên 1
        moduleGroupsRepository.shiftOrdersForInsert(newOrder);

        ModuleGroups entity = new ModuleGroups();
        entity.setName(name);
        entity.setDescription(req.getDescription());
        entity.setDisplayOrder(newOrder);
        entity.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);

        ModuleGroups saved = moduleGroupsRepository.save(entity);

        return moduleGroupMapper.toResponse(saved);
    }

    @Override
    public ModuleGroupDetailResponse update(UUID id, UpdateModuleGroup req) {
        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModuleGroupResponse", "id", id));

        if (!group.getName().equals(req.getName()) && moduleGroupsRepository.existsByName(req.getName())) {
            throw new BadRequestException("Module group name already exists: " + req.getName());
        }

        String name = StringNormalizer.normalize(req.getName());

        if (!group.getName().equals(name)
                && moduleGroupsRepository.existsByName(name)) {
            throw new BadRequestException(
                    "Module group name already exists: " + name
            );
        // --- REORDER ---
        Integer oldOrder = group.getDisplayOrder();
        Integer newOrder = (req.getDisplayOrder() != null) ? req.getDisplayOrder() : oldOrder;
        long currentCount = moduleGroupsRepository.count();

        // Validate Max
        if (newOrder > currentCount) {
            throw new BadRequestException("Display Order cannot exceed " + currentCount);
        }
        if (newOrder < 1) newOrder = 1;

        if (!newOrder.equals(oldOrder)) {
            if (newOrder < oldOrder) {
                // CASE 1: Move UP (VD: 5 -> 2)
                moduleGroupsRepository.shiftOrdersForMoveUp(newOrder, oldOrder);
            } else {
                // CASE 2: Move DOWN (VD: 1 -> 3)
                moduleGroupsRepository.shiftOrdersForMoveDown(oldOrder, newOrder);
            }
        }

        group.setName(name);
        group.setDescription(req.getDescription());
        group.setDisplayOrder(newOrder);
        group.setIsActive(req.getIsActive() != null ? req.getIsActive() : group.getIsActive());

        ModuleGroups saved = moduleGroupsRepository.save(group);

        return moduleGroupMapper.toDetailResponse(saved);
    }


    @Override
    @Transactional
    public void delete(UUID id) {

        ModuleGroups group = moduleGroupsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModuleGroup", "id", id));

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
