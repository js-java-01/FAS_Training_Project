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
    //EXPORT ROLE RA FILE EXCEL
    @PreAuthorize("hasAuthority('ROLE_READ')")
    public ByteArrayInputStream exportRoles() throws IOException {
        // Bước 1: Xóa "Level" khỏi danh sách cột
        String[] columns = {"ID", "Role Name", "Description", "Status", "Permissions"};

        List<Role> roles = roleRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Roles Data");

            // Tạo Header Style (Giữ nguyên)
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);

            // Tạo hàng Header
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            // Đổ dữ liệu
            int rowIdx = 1;
            for (Role role : roles) {
                Row row = sheet.createRow(rowIdx++);

                // Cột 0: ID
                row.createCell(0).setCellValue(role.getId().toString());
                
                // Cột 1: Name
                row.createCell(1).setCellValue(role.getName());
                
                // Cột 2: Description
                row.createCell(2).setCellValue(role.getDescription() != null ? role.getDescription() : "");
                
                // Cột 3: Status 
                row.createCell(3).setCellValue(role.getIsActive() ? "Active" : "Inactive");

                // Cột 4: Permissions
                String perms = role.getPermissions().stream()
                        .map(Permission::getName)
                        .collect(Collectors.joining(", "));
                row.createCell(4).setCellValue(perms);
            }

            // Auto-size các cột
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
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
