package com.example.starter_project_2025.system.auth.service.role;

import com.example.starter_project_2025.base.mapper.BaseCrudMapper;
import com.example.starter_project_2025.base.repository.BaseCrudRepository;
import com.example.starter_project_2025.base.service.CrudServiceImpl;
import com.example.starter_project_2025.system.auth.dto.role.RoleDTO;
import com.example.starter_project_2025.system.auth.dto.role.RoleFilter;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.mapper.RoleMapper;
import com.example.starter_project_2025.system.auth.repository.PermissionCrudRepository;
import com.example.starter_project_2025.system.auth.repository.RoleCrudRepository;
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
public class RoleServiceImpl
        extends CrudServiceImpl<Role, UUID, RoleDTO, RoleFilter>
        implements RoleService {

    RoleMapper roleMapper;
    RoleCrudRepository roleRepository;
    PermissionCrudRepository permissionRepository;

    @Override
    protected BaseCrudRepository<Role, UUID> getRepository() {
        return roleRepository;
    }

    @Override
    protected BaseCrudMapper<Role, RoleDTO> getMapper() {
        return roleMapper;
    }

    @Override
    protected String[] searchableFields() {
        return new String[]{"name", "description"};
    }

    @Override
    protected void beforeCreate(Role role, RoleDTO request) {

        Map<String, List<String>> errors = new HashMap<>();

        validateRoleNameUnique(request.getName(), null, errors);
        validatePermissions(request.getPermissionIds(), errors);

        ErrorUtil.throwIfHasErrors(errors);

        getPermissions(request.getPermissionIds()).forEach(role::addPermission);
    }

    @Override
    protected void beforeUpdate(Role role, RoleDTO request) {

        Map<String, List<String>> errors = new HashMap<>();

        if (request.getName() != null) {
            validateRoleNameUnique(request.getName(), role.getId(), errors);
        }

        if (request.getPermissionIds() != null) {
            validatePermissions(request.getPermissionIds(), errors);
        }

        ErrorUtil.throwIfHasErrors(errors);

        if (request.getPermissionIds() != null) {
            role.setPermissionsSafe(getPermissions(request.getPermissionIds()));
        }
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public Page<RoleDTO> getAll(Pageable pageable, String search, RoleFilter filter) {
        return super.getAllEntity(pageable, search, filter);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public RoleDTO getById(UUID id) {
        return super.getByIdEntity(id);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public RoleDTO create(RoleDTO request) {
        return super.createEntity(request);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleDTO update(UUID id, RoleDTO request) {
        return super.updateEntity(id, request);
    }

    @Override
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void delete(UUID id) {
        super.deleteEntity(id);
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
