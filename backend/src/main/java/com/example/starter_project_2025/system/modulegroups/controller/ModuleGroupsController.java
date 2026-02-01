package com.example.starter_project_2025.system.modulegroups.controller;

import com.example.starter_project_2025.system.modulegroups.dto.request.CreateModuleGroup;
import com.example.starter_project_2025.system.modulegroups.dto.request.UpdateModuleGroup;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupDetailResponse;
import com.example.starter_project_2025.system.modulegroups.dto.response.ModuleGroupResponse;
import com.example.starter_project_2025.system.modulegroups.service.ModuleGroupsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @Operation (summary = "Get all module groups for admin panel")
    @PreAuthorize("hasAuthority('MENU_READ')")
    public ResponseEntity<List<ModuleGroupDetailResponse>> getAllModuleGroups() {
        return ResponseEntity.ok(moduleGroupsService.getAll());
    }


    @GetMapping("/details")
    @Operation (summary = "Get all module group details for admin panel/sidebar")
    @PreAuthorize("hasAuthority('MENU_READ')")
    public ResponseEntity<List<ModuleGroupDetailResponse>> getAllModuleGroupDetails() {
        return ResponseEntity.ok(moduleGroupsService.getAllDetails());
    }

    @GetMapping("/active")
    @Operation(summary = "Get active module groups with active modules (for sidebar)")
    @PreAuthorize("hasAuthority('MENU_READ')")
    public ResponseEntity<List<ModuleGroupDetailResponse>> getActiveModuleGroups() {

        return ResponseEntity.ok(
                moduleGroupsService.getActiveGroupsWithActiveModules()
        );
    }


    @GetMapping("/{id}")
    @Operation (summary = "View module group details by ID")
    @PreAuthorize("hasAuthority('MENU_READ')")
    public ResponseEntity<ModuleGroupDetailResponse> viewModuleGroup(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                moduleGroupsService.getDetailById(id)
        );
    }


    @PostMapping
    @PreAuthorize("hasAuthority('MENU_CREATE')")
    public ResponseEntity<ModuleGroupResponse> createModuleGroup(
            @Valid @RequestBody CreateModuleGroup request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(moduleGroupsService.create(request));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_UPDATE')")
    public ResponseEntity<ModuleGroupDetailResponse> updateModuleGroup(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateModuleGroup request) {

        return ResponseEntity.ok(
                moduleGroupsService.update(id, request)
        );
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MENU_DELETE')")
    public ResponseEntity<Void> deleteModuleGroup(@PathVariable UUID id) {

        moduleGroupsService.delete(id);
        return ResponseEntity.noContent().build(); // 204
    }

//    @PostMapping("/{id}/toggle-status")
//    public ResponseEntity<ModuleGroupsDTO> toggleModuleGroupStatus(@PathVariable UUID id) {
//        return ResponseEntity.ok(moduleGroupsService.toggleStatus(id));
//    }
}
