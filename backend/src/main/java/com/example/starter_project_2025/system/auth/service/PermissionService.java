package com.example.starter_project_2025.system.auth.service;

import com.example.starter_project_2025.system.auth.dto.permission.PermissionDTO;
import com.example.starter_project_2025.system.auth.entity.Permission;
import com.example.starter_project_2025.exception.BadRequestException;
import com.example.starter_project_2025.exception.ResourceNotFoundException;
import com.example.starter_project_2025.system.auth.repository.PermissionRepository;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PermissionService {

    private final PermissionRepository permissionRepository;

    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public Page<PermissionDTO> getAllPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable).map(this::convertToDTO);
    }

    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public List<PermissionDTO> getAllPermissionsList() {
        return permissionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public PermissionDTO getPermissionById(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        return convertToDTO(permission);
    }

    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public Map<String, List<PermissionDTO>> getPermissionsByResource() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream()
                .collect(Collectors.groupingBy(
                        Permission::getResource,
                        Collectors.mapping(this::convertToDTO, Collectors.toList())));
    }

    @PreAuthorize("hasAuthority('PERMISSION_READ')")
    public List<PermissionDTO> getPermissionsByResource(String resource) {
        return permissionRepository.findByResource(resource).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('PERMISSION_CREATE')")
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

    @PreAuthorize("hasAuthority('PERMISSION_UPDATE')")
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

    @PreAuthorize("hasAuthority('PERMISSION_DELETE')")
    public void deletePermission(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        permissionRepository.delete(permission);
    }

    /* ==================== EXPORT ==================== */
    @PreAuthorize("hasAuthority('PERMISSION_EXPORT')")
    public ByteArrayInputStream exportPermissions() throws IOException {
        String[] columns = { "ID", "Name", "Description", "Resource", "Action" };
        List<Permission> permissions = permissionRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Permissions");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Permission p : permissions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(p.getId().toString());
                row.createCell(1).setCellValue(p.getName());
                row.createCell(2).setCellValue(p.getDescription() != null ? p.getDescription() : "");
                row.createCell(3).setCellValue(p.getResource());
                row.createCell(4).setCellValue(p.getAction());
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /* ==================== TEMPLATE ==================== */
    public ByteArrayInputStream downloadTemplate() throws IOException {
        String[] columns = { "Name", "Description", "Resource", "Action" };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Permissions Template");

            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("REPORT_READ");
            sampleRow.createCell(1).setCellValue("View reports");
            sampleRow.createCell(2).setCellValue("REPORT");
            sampleRow.createCell(3).setCellValue("READ");

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /* ==================== IMPORT ==================== */
    @PreAuthorize("hasAuthority('PERMISSION_IMPORT')")
    public ImportResultResponse importPermissions(MultipartFile file) {
        ImportResultResponse result = new ImportResultResponse();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                result.setTotalRows(result.getTotalRows() + 1);
                int displayRow = i + 1;

                try {
                    String name = getCellValue(row.getCell(0));
                    if (name == null || name.isBlank()) {
                        result.addError(displayRow, "name", "Permission name is required");
                        continue;
                    }

                    String resource = getCellValue(row.getCell(2));
                    if (resource == null || resource.isBlank()) {
                        result.addError(displayRow, "resource", "Resource is required");
                        continue;
                    }

                    String action = getCellValue(row.getCell(3));
                    if (action == null || action.isBlank()) {
                        result.addError(displayRow, "action", "Action is required");
                        continue;
                    }

                    if (permissionRepository.existsByName(name.trim())) {
                        result.addError(displayRow, "name", "Permission already exists: " + name.trim());
                        continue;
                    }

                    String description = getCellValue(row.getCell(1));

                    Permission permission = new Permission();
                    permission.setName(name.trim().toUpperCase());
                    permission.setDescription(description);
                    permission.setResource(resource.trim().toUpperCase());
                    permission.setAction(action.trim().toUpperCase());

                    permissionRepository.save(permission);
                    result.addSuccess();
                } catch (Exception e) {
                    result.addError(displayRow, "", e.getMessage());
                }
            }
        } catch (Exception e) {
            result.addError(0, "file", "File error: " + e.getMessage());
        }
        result.buildMessage();
        return result;
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            default:
                return "";
        }
    }

    private PermissionDTO convertToDTO(Permission permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setResource(permission.getResource());
        dto.setAction(permission.getAction());
        dto.setCreatedAt(permission.getCreatedAt());
        return dto;
    }
}
