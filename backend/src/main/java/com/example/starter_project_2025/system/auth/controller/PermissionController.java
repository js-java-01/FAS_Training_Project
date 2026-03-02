package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.system.auth.dto.permission.PermissionDTO;
import com.example.starter_project_2025.system.auth.service.PermissionService;
import com.example.starter_project_2025.system.common.dto.ImportResultResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission Management", description = "APIs for managing permissions")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @Operation(summary = "Get all permissions", description = "Retrieve all permissions with pagination")
    public ResponseEntity<Page<PermissionDTO>> getAllPermissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {

        String[] sortParts = sort.split(",");
        String sortField = sortParts.length > 0 ? sortParts[0] : "name";
        Sort.Direction direction = sortParts.length > 1 ? Sort.Direction.fromString(sortParts[1]) : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
        Page<PermissionDTO> permissions = permissionService.getAllPermissions(pageable);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/list")
    @Operation(summary = "Get all permissions list", description = "Retrieve all permissions as a list")
    public ResponseEntity<List<PermissionDTO>> getAllPermissionsList() {
        List<PermissionDTO> permissions = permissionService.getAllPermissionsList();
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/by-resource")
    @Operation(summary = "Get permissions grouped by resource", description = "Retrieve permissions grouped by resource type")
    public ResponseEntity<Map<String, List<PermissionDTO>>> getPermissionsByResource() {
        Map<String, List<PermissionDTO>> permissions = permissionService.getPermissionsByResource();
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/resource/{resource}")
    @Operation(summary = "Get permissions by resource", description = "Retrieve permissions for a specific resource")
    public ResponseEntity<List<PermissionDTO>> getPermissionsByResource(@PathVariable String resource) {
        List<PermissionDTO> permissions = permissionService.getPermissionsByResource(resource);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get permission by ID", description = "Retrieve a specific permission by ID")
    public ResponseEntity<PermissionDTO> getPermissionById(@PathVariable UUID id) {
        PermissionDTO permission = permissionService.getPermissionById(id);
        return ResponseEntity.ok(permission);
    }

    @PostMapping
    @Operation(summary = "Create permission", description = "Create a new permission")
    public ResponseEntity<PermissionDTO> createPermission(@Valid @RequestBody PermissionDTO permissionDTO) {
        PermissionDTO createdPermission = permissionService.createPermission(permissionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPermission);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update permission", description = "Update an existing permission")
    public ResponseEntity<PermissionDTO> updatePermission(
            @PathVariable UUID id,
            @Valid @RequestBody PermissionDTO permissionDTO) {
        PermissionDTO updatedPermission = permissionService.updatePermission(id, permissionDTO);
        return ResponseEntity.ok(updatedPermission);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete permission", description = "Delete a permission by ID")
    public ResponseEntity<Void> deletePermission(@PathVariable UUID id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }

    /* ==================== EXPORT ==================== */
    @GetMapping("/export")
    @Operation(summary = "Export permissions", description = "Export all permissions to Excel")
    public ResponseEntity<InputStreamResource> exportPermissions() throws IOException {
        ByteArrayInputStream in = permissionService.exportPermissions();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=permissions.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    /* ==================== TEMPLATE ==================== */
    @GetMapping("/template")
    @Operation(summary = "Download import template", description = "Download the Excel template for importing permissions")
    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException {
        ByteArrayInputStream in = permissionService.downloadTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=permissions_template.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    /* ==================== IMPORT ==================== */
    @PostMapping("/import")
    @Operation(summary = "Import permissions", description = "Import permissions from an Excel file")
    public ResponseEntity<ImportResultResponse> importPermissions(@RequestParam("file") MultipartFile file) {
        ImportResultResponse result = permissionService.importPermissions(file);
        return ResponseEntity.ok(result);
    }
}
