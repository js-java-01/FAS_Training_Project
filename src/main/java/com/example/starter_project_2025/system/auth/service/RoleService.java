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
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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
    // 1. Khai báo 5 cột
    String[] columns = {"Role Name", "Description", "Status", "Permissions"};

    List<Role> roles = roleRepository.findAll();

    try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
        Sheet sheet = workbook.createSheet("Roles Data");
        
        // ... (Code tạo Header giữ nguyên) ...

        int rowIdx = 1;
        for (Role role : roles) {
            Row row = sheet.createRow(rowIdx++);

            // 2. Đổ dữ liệu 
            row.createCell(0).setCellValue(role.getName());
            row.createCell(1).setCellValue(role.getDescription() != null ? role.getDescription() : "");
            row.createCell(2).setCellValue(role.getIsActive() ? "Active" : "Inactive");
            
            String perms = role.getPermissions().stream()
                    .map(Permission::getName)
                    .collect(Collectors.joining(", "));
            row.createCell(3).setCellValue(perms);
        }
        // ...
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
    public ByteArrayInputStream downloadTemplate() throws IOException {
    // Khai báo 4 cột giống hệt file Export
    String[] columns = {"Role Name", "Description", "Status", "Permissions"};

    try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
        Sheet sheet = workbook.createSheet("Roles Template");

            // Tạo Header Style
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

            // Tạo hàng mẫu (Example Row)
            Row sampleRow = sheet.createRow(1);
        sampleRow.createCell(0).setCellValue("EDITOR");
        sampleRow.createCell(1).setCellValue("Có quyền chỉnh sửa nội dung");
        sampleRow.createCell(2).setCellValue("Active");
        sampleRow.createCell(3).setCellValue("USER_READ, MENU_READ"); // Ví dụ các quyền cách nhau dấu phẩy

            // Auto-size cột
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // 2. IMPORT ROLE TỪ FILE
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
public void importRoles(MultipartFile file) throws IOException {
    try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
        Sheet sheet = workbook.getSheetAt(0);
        
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // Cột 0: Role Name [Khớp với file Export mới]
            String name = getCellValue(row.getCell(0));
            if (name == null || name.isEmpty() || roleRepository.existsByName(name)) continue;

            // Cột 1: Description
            String description = getCellValue(row.getCell(1));

            // Cột 2: Status ("Active" -> true, "Inactive" -> false)
            String statusStr = getCellValue(row.getCell(2));
            boolean isActive = "Active".equalsIgnoreCase(statusStr);

            // Cột 3: Permissions (Chuỗi cách nhau bởi dấu phẩy)
            String permString = getCellValue(row.getCell(3));
            Set<Permission> permissions = new HashSet<>();
            if (permString != null && !permString.isEmpty()) {
                String[] permNames = permString.split(",");
                for (String pName : permNames) {
                    permissionRepository.findByName(pName.trim())
                            .ifPresent(permissions::add);
                }
            }

            Role role = new Role();
            role.setName(name);
            role.setDescription(description);
            role.setIsActive(isActive);
            role.setPermissions(permissions);
            // role.setHierarchyLevel(1); // Mặc định

            roleRepository.save(role);
        }
    }
}

    // Helper lấy giá trị từ Cell an toàn
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf((int) cell.getNumericCellValue());
            default: return "";
        }
    }
}
