package com.example.starter_project_2025.system.auth.controller;

import com.example.starter_project_2025.system.auth.dto.role.RoleCreateRequest;
import com.example.starter_project_2025.system.auth.dto.role.RoleResponse;
import com.example.starter_project_2025.system.auth.dto.role.RoleUpdateRequest;
import com.example.starter_project_2025.system.auth.entity.Role;
import com.example.starter_project_2025.system.auth.repository.RoleRepository;
import com.example.starter_project_2025.system.auth.service.role.RoleService;
import com.example.starter_project_2025.system.dataio.core.common.FileFormat;
import com.example.starter_project_2025.system.dataio.core.exporter.service.ExportService;
import com.example.starter_project_2025.system.dataio.core.importer.result.ImportResult;
import com.example.starter_project_2025.system.dataio.core.importer.service.ImportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/roles")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Role Management", description = "APIs for managing roles and permissions")
public class RoleController {

    RoleService roleService;
    RoleRepository roleRepository;
    ExportService exportService;
    ImportService importService;

    @GetMapping("/export")
    public void exportFile(
            @RequestParam(defaultValue = "EXCEL") FileFormat format,
            HttpServletResponse response
    ) throws IOException {
        exportService.export(
                format,
                roleRepository.findAll(),
                Role.class,
                response
        );
    }

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ImportResult importFile(
            @RequestParam("file") MultipartFile file
    ) {
        return importService.importFile(
                file,
                Role.class,
                roleRepository
        );
    }

    @GetMapping
    public ResponseEntity<Page<RoleResponse>> getAll(
            @PageableDefault Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) List<UUID> permissionIds,
            @RequestParam(required = false) LocalDateTime createFrom,
            @RequestParam(required = false) LocalDateTime createTo
    ) {
        return ResponseEntity.ok(roleService.getAll(
                pageable,
                search,
                isActive,
                permissionIds,
                createFrom,
                createTo
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getById(
            @PathVariable UUID id
    ) {
        RoleResponse role = roleService.getById(id);
        return ResponseEntity.ok(role);
    }

    @PostMapping
    public ResponseEntity<RoleResponse> create(
            @Valid @RequestBody RoleCreateRequest request
    ) {
        return ResponseEntity.ok(roleService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody RoleUpdateRequest request
    ) {
        return ResponseEntity.ok(roleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id
    ) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
