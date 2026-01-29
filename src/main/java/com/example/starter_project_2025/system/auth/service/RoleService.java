package com.example.starter_project_2025.system.auth.service;

import com.example.starter_project_2025.system.auth.dto.RoleDTO;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public Page<RoleDTO> getAllRoles(Pageable pageable) {
        return roleRepository.findAll(pageable).map(this::convertToDTO);
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public RoleDTO getRoleById(UUID id) {
        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return convertToDTO(role);
    }

    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public RoleDTO createRole(RoleDTO roleDTO) {
        if (roleRepository.existsByName(roleDTO.getName())) {
            throw new BadRequestException("Role name already exists: " + roleDTO.getName());
        }

        Role role = new Role();
        role.setName(roleDTO.getName());
        role.setDescription(roleDTO.getDescription());
        role.setHierarchyLevel(roleDTO.getHierarchyLevel() != null ? roleDTO.getHierarchyLevel() : 0);
        role.setIsActive(true);

        if (roleDTO.getPermissionIds() != null && !roleDTO.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(roleDTO.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return convertToDTO(savedRole);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleDTO updateRole(UUID id, RoleDTO roleDTO) {
        Role role = roleRepository.findByIdWithPermissions(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        if (roleDTO.getName() != null && !roleDTO.getName().equals(role.getName())) {
            if (roleRepository.existsByName(roleDTO.getName())) {
                throw new BadRequestException("Role name already exists: " + roleDTO.getName());
            }
            role.setName(roleDTO.getName());
        }

        if (roleDTO.getDescription() != null) {
            role.setDescription(roleDTO.getDescription());
        }

        if (roleDTO.getHierarchyLevel() != null) {
            role.setHierarchyLevel(roleDTO.getHierarchyLevel());
        }

        if (roleDTO.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>(
                    permissionRepository.findAllById(roleDTO.getPermissionIds())
            );
            role.setPermissions(permissions);
        }

        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        roleRepository.delete(role);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleDTO toggleRoleStatus(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        role.setIsActive(!role.getIsActive());
        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleDTO addPermissionsToRole(UUID roleId, Set<UUID> permissionIds) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));
        role.getPermissions().addAll(permissions);

        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public RoleDTO removePermissionsFromRole(UUID roleId, Set<UUID> permissionIds) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));

        role.getPermissions().removeIf(p -> permissionIds.contains(p.getId()));

        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setHierarchyLevel(role.getHierarchyLevel());
        dto.setIsActive(role.getIsActive());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());

        if (role.getPermissions() != null) {
            dto.setPermissionIds(
                    role.getPermissions().stream()
                            .map(Permission::getId)
                            .collect(Collectors.toSet())
            );
            dto.setPermissionNames(
                    role.getPermissions().stream()
                            .map(Permission::getName)
                            .collect(Collectors.toSet())
            );
        }

        return dto;
    }
}
