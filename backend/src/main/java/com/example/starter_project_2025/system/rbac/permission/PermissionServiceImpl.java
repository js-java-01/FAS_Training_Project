package com.example.starter_project_2025.system.rbac.permission;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.exception.BadRequestException;
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
public class PermissionServiceImpl
        extends CrudServiceImpl<Permission, UUID, PermissionDTO, PermissionFilter>
        implements PermissionService {

    PermissionMapper permissionMapper;
    PermissionRepository permissionRepository;

    @Override
    protected BaseCrudRepository<Permission, UUID> getRepository() {
        return permissionRepository;
    }

    @Override
    protected BaseCrudMapper<Permission, PermissionDTO> getMapper() {
        return permissionMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name", "description", "resource", "action"};
    }

    @Override
    protected void beforeCreate(Permission permission,
                                PermissionDTO request) {

        if (permissionRepository.existsByName(request.getName())) {
            throw new BadRequestException("Permission name already exists");
        }
    }

    @Override
    protected void beforeUpdate(Permission permission,
                                PermissionDTO request) {

        if (request.getName() != null &&
                !request.getName().equals(permission.getName()) &&
                permissionRepository.existsByName(request.getName())) {

            throw new BadRequestException("Permission name already exists");
        }
    }

    @Override
    public Page<PermissionDTO> getAll(Pageable pageable, String search, PermissionFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    public PermissionDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    public PermissionDTO create(PermissionDTO request) {
        return super.createEntity(request);
    }

    @Override
    public PermissionDTO update(UUID id, PermissionDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    public void delete(UUID id) {
        super.deleteEntity(id);
    }
}
