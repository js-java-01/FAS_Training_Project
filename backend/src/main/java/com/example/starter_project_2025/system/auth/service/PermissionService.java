package com.example.starter_project_2025.system.auth.service;

import com.example.starter_project_2025.system.auth.dto.permission.PermissionDTO;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public Page<PermissionDTO> getAllPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable).map(this::convertToDTO);
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public List<PermissionDTO> getAllPermissionsList() {
        return permissionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public PermissionDTO getPermissionById(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        return convertToDTO(permission);
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public Map<String, List<PermissionDTO>> getPermissionsByResource() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream()
                .collect(Collectors.groupingBy(
                        Permission::getResource,
                        Collectors.mapping(this::convertToDTO, Collectors.toList())
                ));
    }

    @PreAuthorize("hasAuthority('ROLE_READ')")
    public List<PermissionDTO> getPermissionsByResource(String resource) {
        return permissionRepository.findByResource(resource).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    public PermissionDTO createPermission(PermissionDTO permissionDTO) {
        if (permissionRepository.existsByName(permissionDTO.getName())) {
            throw new BadRequestException("Permission name already exists: " + permissionDTO.getName());
        }

        Permission permission = new Permission();
        permission.setName(permissionDTO.getName());
        permission.setDescription(permissionDTO.getDescription());
        permission.setResource(permissionDTO.getResource());
        permission.setAction(permissionDTO.getAction());

        Permission savedPermission = permissionRepository.save(permission);
        return convertToDTO(savedPermission);
    }

    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    public PermissionDTO updatePermission(UUID id, PermissionDTO permissionDTO) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));

        if (permissionDTO.getName() != null && !permissionDTO.getName().equals(permission.getName())) {
            if (permissionRepository.existsByName(permissionDTO.getName())) {
                throw new BadRequestException("Permission name already exists: " + permissionDTO.getName());
            }
            permission.setName(permissionDTO.getName());
        }

        if (permissionDTO.getDescription() != null) {
            permission.setDescription(permissionDTO.getDescription());
        }

        if (permissionDTO.getResource() != null) {
            permission.setResource(permissionDTO.getResource());
        }

        if (permissionDTO.getAction() != null) {
            permission.setAction(permissionDTO.getAction());
        }

        Permission updatedPermission = permissionRepository.save(permission);
        return convertToDTO(updatedPermission);
    }

    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    public void deletePermission(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        permissionRepository.delete(permission);
    }

    private PermissionDTO convertToDTO(Permission permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setResource(permission.getResource());
        dto.setAction(permission.getAction());
        return dto;
    }
}
