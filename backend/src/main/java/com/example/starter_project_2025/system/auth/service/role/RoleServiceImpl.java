package com.example.starter_project_2025.system.auth.service.role;

import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.dto.role.RoleCreateRequest;
import com.example.starter_project_2025.system.auth.dto.role.RoleResponse;
import com.example.starter_project_2025.system.auth.dto.role.RoleUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.mapper.RoleMapper;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.spec.RoleSpecification;
import com.example.starter_project_2025.system.user.entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService{

    RoleMapper roleMapper;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public Page<RoleResponse> getAll(
            Pageable pageable,
            String search,
            Boolean isActive,
            List<UUID> permissionIds,
            LocalDateTime createFrom,
            LocalDateTime createTo
    ) {
        Specification<Role> spec = Specification
                .where(RoleSpecification.hasKeyword(search))
                .and(RoleSpecification.isActive(isActive))
                .and(RoleSpecification.hasPermissionIds(permissionIds))
                .and(RoleSpecification.createdAfter(createFrom))
                .and(RoleSpecification.createdBefore(createTo));

        return roleRepository.findAll(spec, pageable).map(roleMapper::toResponse);
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public RoleResponse getById(UUID id) {
        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return roleMapper.toResponse(role);
    }

    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public RoleResponse create(RoleCreateRequest request) {

        if (roleRepository.existsByName(request.name())) {
            throw new BadRequestException("Role name already exists");
        }

        Role role = roleMapper.toEntity(request);

        Set<Permission> permissions = fetchPermissions(request.permissionIds());
        role.setPermissions(permissions);

        return roleMapper.toResponse(roleRepository.save(role));
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleResponse update(UUID id, RoleUpdateRequest request) {

        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (request.name() != null && !request.name().equals(role.getName())) {
            if (roleRepository.existsByName(request.name())) {
                throw new BadRequestException("Role name already exists");
            }
        }

        roleMapper.update(role, request);

        if (request.permissionIds() != null) {
            role.setPermissions(fetchPermissions(request.permissionIds()));
        }

        return roleMapper.toResponse(roleRepository.save(role));
    }


    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void delete(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        roleRepository.delete(role);
    }

    private Set<Permission> fetchPermissions(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(permissionRepository.findAllById(ids));
    }
}
