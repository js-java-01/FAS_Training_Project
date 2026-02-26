package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.system.auth.dto.role.RoleDTO;
import com.example.starter_project_2025.system.auth.service.RoleService;
import io.jsonwebtoken.io.IOException;
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
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Role Management", description = "APIs for managing roles and permissions")
@SecurityRequirement(name = "bearerAuth")
public class RoleController
{

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "Get all roles", description = "Retrieve all roles with pagination")
    public ResponseEntity<Page<RoleDTO>> getAllRoles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String[] sort)
    {

        Sort.Direction direction = Sort.Direction.fromString(sort[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        Page<RoleDTO> roles = roleService.getAllRoles(pageable);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Retrieve a specific role by ID with permissions")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable UUID id)
    {
        RoleDTO role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }

    @PostMapping
    @Operation(summary = "Create role", description = "Create a new role with permissions")
    public ResponseEntity<RoleDTO> createRole(@Valid @RequestBody RoleDTO roleDTO)
    {
        RoleDTO createdRole = roleService.createRole(roleDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Update an existing role")
    public ResponseEntity<RoleDTO> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody RoleDTO roleDTO)
    {
        RoleDTO updatedRole = roleService.updateRole(id, roleDTO);
        return ResponseEntity.ok(updatedRole);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Delete a role by ID")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id)
    {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle role locationStatus", description = "Activate or deactivate a role")
    public ResponseEntity<RoleDTO> toggleRoleStatus(@PathVariable UUID id)
    {
        RoleDTO role = roleService.toggleRoleStatus(id);
        return ResponseEntity.ok(role);
    }

    @PostMapping("/{roleId}/permissions/add")
    @Operation(summary = "Add permissions to role", description = "Add multiple permissions to a role")
    public ResponseEntity<RoleDTO> addPermissionsToRole(
            @PathVariable UUID roleId,
            @RequestBody Map<String, Set<UUID>> request)
    {
        Set<UUID> permissionIds = request.get("permissionIds");
        RoleDTO role = roleService.addPermissionsToRole(roleId, permissionIds);
        return ResponseEntity.ok(role);
    }

    @PostMapping("/{roleId}/permissions/remove")
    @Operation(summary = "Remove permissions from role", description = "Remove multiple permissions from a role")
    public ResponseEntity<RoleDTO> removePermissionsFromRole(
            @PathVariable UUID roleId,
            @RequestBody Map<String, Set<UUID>> request)
    {
        Set<UUID> permissionIds = request.get("permissionIds");
        RoleDTO role = roleService.removePermissionsFromRole(roleId, permissionIds);
        return ResponseEntity.ok(role);
    }

    @GetMapping("/template")
    public ResponseEntity<InputStreamResource> downloadTemplate() throws IOException, java.io.IOException
    {
        ByteArrayInputStream in = roleService.downloadTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=roles_import_template.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    // API Upload file Import
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> importRoles(@RequestParam("file") MultipartFile file) throws IOException, java.io.IOException
    {
        roleService.importRoles(file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export")
    @Operation(summary = "Export roles", description = "Export all roles to Excel file")
    public ResponseEntity<InputStreamResource> exportRoles() throws IOException, java.io.IOException
    {
        ByteArrayInputStream in = roleService.exportRoles();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=roles_export.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
