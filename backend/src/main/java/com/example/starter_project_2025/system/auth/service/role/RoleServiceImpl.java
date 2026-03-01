package com.example.starter_project_2025.system.auth.service.role;

import com.example.starter_project_2025.base.mapper.BaseMapper;
import com.example.starter_project_2025.base.repository.BaseRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.auth.dto.role.RoleCreateRequest;
import com.example.starter_project_2025.system.auth.dto.role.RoleFilter;
import com.example.starter_project_2025.system.auth.dto.role.RoleResponse;
import com.example.starter_project_2025.system.auth.dto.role.RoleUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.mapper.RoleMapper;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.common.error.ErrorUtil;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl extends CrudServiceImpl<
        Role,
        UUID,
        RoleResponse,
        RoleCreateRequest,
        RoleUpdateRequest,
        RoleFilter
        > implements RoleService {

    RoleMapper roleMapper;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;

    @Override
    protected BaseRepository<Role, UUID> getRepository() {
        return roleRepository;
    }

    @Override
    protected BaseMapper<Role, RoleResponse, RoleCreateRequest, RoleUpdateRequest> getMapper() {
        return roleMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{ "name", "description"};
    }

    @Override
    protected void beforeCreate(Role role, RoleCreateRequest request) {

        Map<String, List<String>> errors = new HashMap<>();

        validateRoleNameUnique(request.name(), null, errors);
        validatePermissions(request.permissionIds(), errors);

        ErrorUtil.throwIfHasErrors(errors);

        getPermissions(request.permissionIds()).forEach(role::addPermission);
    }

    @Override
    protected void beforeUpdate(Role role, RoleUpdateRequest request) {

        Map<String, List<String>> errors = new HashMap<>();

        if (request.name() != null) {
            validateRoleNameUnique(request.name(), role.getId(), errors);
        }

        if (request.permissionIds() != null) {
            validatePermissions(request.permissionIds(), errors);
        }

        ErrorUtil.throwIfHasErrors(errors);

        if (request.permissionIds() != null) {
            role.setPermissionsSafe(getPermissions(request.permissionIds()));
        }
    }


    @Override
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public Page<RoleResponse> getAll(Pageable pageable, String search, RoleFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public RoleResponse getById(UUID uuid) {
        return super.getByIdEntity(uuid);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public RoleResponse create(RoleCreateRequest request) {
        return super.createEntity(request);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleResponse update(UUID id, RoleUpdateRequest request) {
        return super.updateEntity(id, request);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void delete(UUID uuid) {
        super.deleteEntity(uuid);
    }

    private void validateRoleNameUnique(String name, UUID currentId,
                                        Map<String, List<String>> errors) {

        Optional<Role> existing = roleRepository.findByName(name);

        if (existing.isPresent() &&
                (currentId == null || !existing.get().getId().equals(currentId))) {

            ErrorUtil.addError(errors, "name", "Role name already exists");
        }
    }

    private void validatePermissions(Set<UUID> permissionIds,
                                     Map<String, List<String>> errors) {

        if (permissionIds == null || permissionIds.isEmpty()) {
            ErrorUtil.addError(errors, "permissionIds",
                    "At least one permission must be assigned");
            return;
        }

        long found = permissionRepository.countByIdIn(permissionIds);

        if (found != permissionIds.size()) {
            ErrorUtil.addError(errors, "permissionIds",
                    "One or more permissions are invalid");
        }
    }

    private Set<Permission> getPermissions(Set<UUID> ids) {
        return new HashSet<>(permissionRepository.findAllById(ids));
    }
}
