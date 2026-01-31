package com.example.starter_project_2025.system.modulegroups.controller;

import com.example.starter_project_2025.system.modulegroups.dto.ModuleGroupsDTO;
import com.example.starter_project_2025.system.modulegroups.service.ModuleGroupsService;
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
@RequestMapping("/api/module-groups")
@RequiredArgsConstructor
@Tag(name = "Module Group Management", description = "APIs for managing module groups")
@SecurityRequirement(name = "bearerAuth")
public class ModuleGroupsController {

    private final ModuleGroupsService moduleGroupsService;

    @GetMapping
    public ResponseEntity<Page<ModuleGroupsDTO>> getAllModuleGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "displayOrder,asc") String[] sort) {

        Sort.Direction direction = Sort.Direction.fromString(sort[1]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));

        return ResponseEntity.ok(moduleGroupsService.getAll(pageable));
    }

    @GetMapping("/list")
    public ResponseEntity<List<ModuleGroupsDTO>> getAllModuleGroupsList() {
        return ResponseEntity.ok(moduleGroupsService.getAllList());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ModuleGroupsDTO>> getActiveModuleGroups() {
        return ResponseEntity.ok(moduleGroupsService.getActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleGroupsDTO> getModuleGroupById(@PathVariable UUID id) {
        return ResponseEntity.ok(moduleGroupsService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ModuleGroupsDTO> createModuleGroup(
            @Valid @RequestBody ModuleGroupsDTO dto) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(moduleGroupsService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ModuleGroupsDTO> updateModuleGroup(
            @PathVariable UUID id,
            @Valid @RequestBody ModuleGroupsDTO dto) {

        return ResponseEntity.ok(moduleGroupsService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModuleGroup(@PathVariable UUID id) {
        moduleGroupsService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle-status")
    public ResponseEntity<ModuleGroupsDTO> toggleModuleGroupStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(moduleGroupsService.toggleStatus(id));
    }
}
