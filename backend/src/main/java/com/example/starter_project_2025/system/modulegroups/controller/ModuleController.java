package com.example.starter_project_2025.system.modulegroups.controller;

import com.example.starter_project_2025.system.modulegroups.dto.ModuleDTO;
import com.example.starter_project_2025.system.modulegroups.service.ModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
@Tag(name = "Module Management", description = "APIs for managing modules")
@SecurityRequirement(name = "Bearer Authentication")
public class ModuleController {

    private final ModuleService moduleService;

    @GetMapping
    @Operation(summary = "Get all modules")
    public ResponseEntity<Page<ModuleDTO>> getAllModules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "displayOrder,asc") String[] sort) {

        Sort.Direction direction = Sort.Direction.fromString(sort[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));

        return ResponseEntity.ok(
                moduleService.getAllModules(pageable)
        );
    }

    @GetMapping("/group/{moduleGroupId}")
    @Operation(summary = "Get modules by module group")
    public ResponseEntity<List<ModuleDTO>> getModulesByGroup(
            @PathVariable UUID moduleGroupId) {

        return ResponseEntity.ok(
                moduleService.getModulesByMenu(moduleGroupId)
        );
    }

    @GetMapping("/group/{moduleGroupId}/root")
    @Operation(summary = "Get root modules")
    public ResponseEntity<List<ModuleDTO>> getRootModules(
            @PathVariable UUID moduleGroupId) {

        return ResponseEntity.ok(
                moduleService.getRootModules(moduleGroupId)
        );
    }

    @GetMapping("/parent/{parentId}")
    @Operation(summary = "Get child modules")
    public ResponseEntity<List<ModuleDTO>> getChildModules(
            @PathVariable UUID parentId) {

        return ResponseEntity.ok(
                moduleService.getChildModules(parentId)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get module by ID")
    public ResponseEntity<ModuleDTO> getModuleById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                moduleService.getModuleById(id)
        );
    }

    @PostMapping
    @Operation(summary = "Create module")
    public ResponseEntity<ModuleDTO> createModule(
            @Valid @RequestBody ModuleDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(moduleService.createModule(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update module")
    public ResponseEntity<ModuleDTO> updateModule(
            @PathVariable UUID id,
            @Valid @RequestBody ModuleDTO dto) {

        return ResponseEntity.ok(
                moduleService.updateModule(id, dto)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete module")
    public ResponseEntity<Void> deleteModule(@PathVariable UUID id) {
        moduleService.deleteModule(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle module status")
    public ResponseEntity<ModuleDTO> toggleModuleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(
                moduleService.toggleModuleStatus(id)
        );
    }
}
