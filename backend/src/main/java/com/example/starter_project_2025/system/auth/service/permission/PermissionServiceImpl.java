package com.example.starter_project_2025.system.auth.service.permission;

import com.example.starter_project_2025.base.mapper.BaseMapper;
import com.example.starter_project_2025.base.repository.BaseRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionCreateRequest;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionFilter;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionResponse;
import com.example.starter_project_2025.system.auth.dto.permission.PermissionUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.mapper.PermissionMapper;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionServiceImpl extends CrudServiceImpl<
        Permission,
        UUID,
        PermissionResponse,
        PermissionCreateRequest,
        PermissionUpdateRequest,
        PermissionFilter
        > implements PermissionService {

    PermissionMapper permissionMapper;
    PermissionRepository permissionRepository;

    @Override
    protected BaseRepository<Permission, UUID> getRepository() {
        return permissionRepository;
    }

    @Override
    protected BaseMapper<Permission, PermissionResponse, PermissionCreateRequest, PermissionUpdateRequest> getMapper() {
        return permissionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name", "description", "resource", "action"};
    }

    @Override
    protected void beforeCreate(Permission permission,
                                PermissionCreateRequest request) {

        if (permissionRepository.existsByName(request.name())) {
            throw new BadRequestException("Permission name already exists");
        }
    }

    @Override
    protected void beforeUpdate(Permission permission,
                                PermissionUpdateRequest request) {

        if (request.name() != null &&
                !request.name().equals(permission.getName()) &&
                permissionRepository.existsByName(request.name())) {

            throw new BadRequestException("Permission name already exists");
        }
    }

    @Override
    public Page<PermissionResponse> getAll(Pageable pageable, String search, PermissionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public PermissionResponse getById(UUID uuid) {
        return super.getByIdEntity(uuid);
    }

    @Override
    public PermissionResponse create(PermissionCreateRequest request) {
        return super.createEntity(request);
    }

    @Override
    public PermissionResponse update(UUID uuid, PermissionUpdateRequest request) {
        return super.updateEntity(uuid, request);
    }

    @Override
    public void delete(UUID uuid) {
        super.deleteEntity(uuid);
    }
}
