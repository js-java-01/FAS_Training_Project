package com.example.starter_project_2025.system.rbac.role;

import com.example.starter_project_2025.base.crud.BaseCrudMapper;
import com.example.starter_project_2025.base.crud.BaseCrudRepository;
import com.example.starter_project_2025.base.crud.CrudServiceImpl;
import com.example.starter_project_2025.security.UserDetailsImpl;
import com.example.starter_project_2025.system.auth.dto.role.RoleSummaryDTO;
import com.example.starter_project_2025.system.auth.repository.UserRoleRepository;
import com.example.starter_project_2025.system.rbac.permission.Permission;
import com.example.starter_project_2025.system.rbac.permission.PermissionRepository;
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
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl
        extends CrudServiceImpl<Role, UUID, RoleDTO, RoleFilter>
        implements RoleService {

    RoleMapper roleMapper;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    UserRoleRepository userRoleRepository;

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

    @Override
    public List<RoleSummaryDTO> getMyRoles(UserDetailsImpl userDetails) {
//        var assigned = userRoleRepository.findByUserIdWithPermissions(userDetails.getId());
//
//        // Build list of own active assigned roles
//        List<RoleSummaryDTO> ownRoles = assigned.stream()
//                .filter(ur -> Boolean.TRUE.equals(ur.getRole().getIsActive()))
//                .map(ur -> toRoleSummaryDTO(ur.getRole()))
//                .collect(Collectors.toList());
//
//        if (ownRoles.isEmpty()) {
//            // Fallback: build from current JWT context
//            Role ownRole = roleRepository.findByName(userDetails.getRole()).orElse(null);
//            if (ownRole == null)
//                return List.of();
//            ownRoles = List.of(toRoleSummaryDTO(ownRole));
//        }
//
//        // Find the minimum (highest-privilege) hierarchyLevel among the user's own
//        // roles
//        int minLevel = ownRoles.stream()
//                .mapToInt(r -> r.getHierarchyLevel() != null ? r.getHierarchyLevel() : 0)
//                .filter(l -> l > 0)
//                .min()
//                .orElse(0);
//
//        if (minLevel == 0) {
//            // No hierarchy set — just return own roles
//            return ownRoles;
//        }

        // Fetch all active roles at equal or lower privilege
//        List<Role> switchable = roleRepository.findAllActiveWithMinHierarchyLevel(minLevel);
//
//        // Merge: own roles first, then remaining switchable roles (dedup by id)
//        Map<UUID, RoleSummaryDTO> merged = new LinkedHashMap<>();
//        ownRoles.forEach(r -> merged.put(r.getId(), r));
//        switchable.forEach(r -> merged.putIfAbsent(r.getId(), toRoleSummaryDTO(r)));

        return new ArrayList<>(
//                merged.values()
        );


    }
    private RoleSummaryDTO toRoleSummaryDTO(Role role) {
        return new RoleSummaryDTO(
                role.getId(),
                role.getName(),
                role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.toSet()),
                role.getIsActive()

//                role.getHierarchyLevel()
        );
    }

}
